// Liquid Vapor Glass (JavaScript / Three.js WebGL implementation for SKYCOBE)
//
// Derived verbatim from Blur my Shell / Liquid Vapor Glass (GPL-3.0):
//   - Pass 1 (VAPOR_GLSL): Simplex FBM "wave" + ridged "vapor" + 4-wave "water" Jacobian caustics
//   - Pass 2 (GLASS_GLSL): Liquid Glass refraction.glsl (quartz + snell edge refraction, RGB dispersion,
//                          edgeGlowColor, Fresnel glare, dark edge border, specular glare, inner shadow)
//   - Architecture mirrors CONFIG, FlowTicker, VaporWaveEffect, LiquidGlassEffect, and GlassSurface.

import * as THREE from 'three';

const TAU = Math.PI * 2;
const TIME_FACTOR = 0.001; // ms -> phase, same as Blur my Shell's wave effect

const VAPOR_GLSL = `
precision highp float;

uniform sampler2D tex;
uniform float has_backdrop_tex;
uniform vec2 card_uv_center;
uniform vec2 card_uv_span;
uniform float is_dark_theme;

uniform float width;
uniform float height;
uniform float surface_max_size;

uniform float clip_x0;
uniform float clip_y0;
uniform float clip_width;
uniform float clip_height;

uniform float frequency;
uniform float amplitude;
uniform int octaves;

uniform int vapor_octaves;
uniform float vapor_speed;

uniform float grain;
uniform float zoom;
uniform float dispersion;

uniform float saturation;
uniform float brightness;

// water layer
uniform float water_amplitude;   // ripple displacement, logical px
uniform float water_wavelength;  // logical px
uniform float water_caustics;    // 0..1 caustic light strength

uniform float time;

varying vec2 vUv;

#define MAX_OCTAVES 8
#define REFERENCE_SIZE 300.0
#define WAVE_RADIUS 150.0
#define VAPOR_RADIUS 60.0
#define TWO_PI 6.28318530718

vec4 getTextureColorAt(vec2 coord) {
    // Map widget-local top-down pixel coordinates onto the underlying card photo UV window
    vec2 localUv = coord / vec2(width, height);
    if (has_backdrop_tex > 0.5) {
        vec2 cardUv = clamp(
            card_uv_center + vec2(localUv.x - 0.5, (1.0 - localUv.y) - 0.5) * card_uv_span,
            vec2(0.002),
            vec2(0.998)
        );
        return texture2D(tex, cardUv);
    }

    // Procedural architectural surface backdrop when no photo lies underneath (e.g. Details header)
    vec2 uv = clamp(localUv, vec2(0.0), vec2(1.0));
    vec3 baseCol = is_dark_theme > 0.5 ? vec3(0.71, 0.71, 0.72) : vec3(0.945, 0.950, 0.935);
    vec3 hiCol   = is_dark_theme > 0.5 ? vec3(0.84, 0.85, 0.87) : vec3(0.995, 1.0, 0.99);
    vec3 loCol   = is_dark_theme > 0.5 ? vec3(0.54, 0.55, 0.57) : vec3(0.81, 0.83, 0.80);
    float band = sin(uv.x * 7.5 + uv.y * 5.0) * 0.5 + 0.5;
    float grad = clamp(uv.y * 0.65 + uv.x * 0.35, 0.0, 1.0);
    return vec4(mix(mix(loCol, baseCol, grad), hiCol, band * 0.42), 1.0);
}

vec4 get_clipped_bounding() {
    float x0 = clip_x0;
    float y0 = clip_y0;
    float w = clip_width;
    float h = clip_height;

    if (clip_width < 0.0)
        w = width;

    if (clip_height < 0.0)
        h = height;

    return vec4(x0, y0, w, h);
}

// Simplex noise from webgl-noise (MIT)
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289((x * 34.0 + 10.0) * x);
}

float snoise(vec2 v) {
    const vec4 C = vec4(
        0.211324865405187,
        0.366025403784439,
        -0.577350269189626,
        0.024390243902439
    );

    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    vec2 i1;
    i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    i = mod289(i);
    vec3 p = permute(
        permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
    );

    vec3 m = max(
        0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
        0.0
    );
    m = m * m;
    m = m * m;

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float smoothAbs(float x, float k) {
    return sqrt(x * x + k * k) - k;
}

float fbm(vec2 coord, float ampl, float freq, int oct, bool ridged) {
    float a = 2.0 * ampl;
    float f = 0.01 * freq;
    float value = 0.0;

    for (int i = 0; i < MAX_OCTAVES; i++) {
        if (i >= oct) break;

        float n = snoise(coord * f);
        value += a * (ridged ? smoothAbs(n, 1.5) : n);
        f *= 2.0;
        a *= 0.5;
    }

    return value;
}

vec3 adjust_saturation(vec3 color, float amount) {
    float lum = dot(color, vec3(0.2125, 0.7154, 0.0721));
    return mix(vec3(lum), color, amount);
}

// Water surface: four travelling ripples. D is the displacement (logical px)
// a ray picks up crossing the surface, i.e. the height-field gradient scaled
// by 1/k. Writes the 2x2 Jacobian of (p + D) so the caller can derive caustics.
vec2 water_displacement(vec2 p, float t, out vec4 jac) {
    vec2 d_sum = vec2(0.0);
    vec4 j = vec4(0.0); // (dDx/dx, dDx/dy, dDy/dx, dDy/dy)
    float k0 = TWO_PI / max(water_wavelength, 8.0);

    for (int i = 0; i < 4; i++) {
        float fi = float(i);
        float ang = 0.55 + fi * 1.9;
        vec2 dir = vec2(cos(ang), sin(ang));
        float k = k0 * (1.0 + fi * 0.45);
        float spd = 1.0 + mod(fi, 3.0);              // 1, 2, 3, 1  (integers)
        float sgn = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0; // alternate heading
        float w = 1.0 / (1.0 + fi * 0.7);

        float phase = dot(dir, p) * k + sgn * spd * t + fi * 1.3;
        float c = cos(phase);
        float s = sin(phase);

        d_sum += w * c * dir;
        vec2 g = -w * s * k * dir;
        j += vec4(g.x * dir.x, g.y * dir.x, g.x * dir.y, g.y * dir.y);
    }

    jac = j * water_amplitude;
    return d_sum * water_amplitude * 0.6;
}

void main() {
    vec2 resolution = vec2(width, height);
    vec2 uv = vec2(vUv.x, 1.0 - vUv.y); // top-down pixel coordinates matching Clutter
    vec2 frag_coord = uv * resolution;

    vec4 bounding = get_clipped_bounding();

    vec2 surface_size = bounding.zw;
    vec2 surface_half = surface_size * 0.5;
    vec2 surface_center = bounding.xy + surface_half;
    vec2 surface_coord = frag_coord - surface_center;
    vec2 surface_local = surface_coord / surface_half;

    if (
        surface_local.x < -1.0 ||
        surface_local.x > 1.0 ||
        surface_local.y < -1.0 ||
        surface_local.y > 1.0
    ) {
        discard;
    }

    float surface_scale = max(0.15, REFERENCE_SIZE / surface_max_size);
    vec2 surface_space = surface_coord * surface_scale;
    float surface_large_factor = min(1.0, surface_scale);

    vec2 wave_a = WAVE_RADIUS * vec2(cos(time), sin(time));
    vec2 wave_b =
        WAVE_RADIUS * vec2(cos(time + 2.1), sin(time + 2.1)) + vec2(37.0, 91.0);

    vec2 vapor_offset =
        VAPOR_RADIUS * vapor_speed * vec2(cos(-time), sin(-time));

    vec2 wave_displacement = vec2(
        fbm(surface_space + wave_a,
            amplitude * surface_large_factor,
            frequency * surface_large_factor,
            octaves, false),
        fbm(surface_space + wave_b,
            amplitude * surface_large_factor,
            frequency * surface_large_factor,
            octaves, false)
    );

    vec2 wave_offset = 1.0 - wave_displacement * 0.5;

    if (grain > 0.0) {
        wave_offset += snoise(frag_coord) * grain * 0.05;
    }

    float vapor_frequency = frequency * 3.0 * surface_large_factor;
    float vapor_amplitude = amplitude * 1.5 * surface_large_factor;

    float vapor_displacement =
        1.0 -
        fbm(surface_coord + vapor_offset,
            vapor_amplitude, vapor_frequency, vapor_octaves, true);

    vec2 zoomed_local = surface_coord / max(zoom, 0.001);

    vec2 sample_coord =
        surface_center + zoomed_local * vapor_displacement * wave_offset;

    // Water ripples refract the lookup and leave caustic light behind.
    float caustic = 0.0;
    if (water_amplitude > 0.0) {
        vec4 jac;
        vec2 ripple = water_displacement(surface_coord, time, jac);
        sample_coord += ripple;

        // Jacobian of p + D; its determinant is the local light magnification.
        float det = (1.0 + jac.x) * (1.0 + jac.w) - jac.y * jac.z;
        caustic = clamp(1.0 / max(abs(det), 0.3) - 1.0, 0.0, 1.5);
    }

    vec4 base_color = getTextureColorAt(sample_coord);
    vec4 final_color = base_color;

    if (dispersion > 0.0) {
        vec2 shift = surface_local * mix(0.0, 3.0, dispersion);
        vec4 left_sample = getTextureColorAt(sample_coord - shift);
        vec4 right_sample = getTextureColorAt(sample_coord + shift);

        final_color = vec4(
            left_sample.r,
            base_color.g,
            right_sample.b,
            base_color.a
        );
    }

    vec3 rgb = adjust_saturation(final_color.rgb, saturation) * brightness;

    // Soft caustic shimmer: brightens, never darkens, scaled by what's under it.
    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb += caustic * water_caustics * 0.16 * (0.35 + lum);

    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), final_color.a);
}
`;

const GLASS_GLSL = `
precision highp float;

uniform sampler2D tex;
uniform float width;
uniform float height;
uniform float strength;
uniform float edge_size;
uniform float falloff;
uniform float refraction_style;
uniform float corner_radius;
uniform int corners_top;
uniform int corners_bottom;
uniform float rim_width;
uniform float reach;
uniform float rgb_fringing;
uniform float gloss;
uniform float fresnel_angle;
uniform float fresnel_width;
uniform int fresnel_two_sided;
uniform float specular_strength;
uniform float edge_shadow;
uniform float edge_glow;
uniform float tint;
uniform float tint_r;
uniform float tint_g;
uniform float tint_b;
uniform float tint_a;
uniform float backdrop_zoom;
uniform float shadow;
uniform float opacity_factor;
uniform float aa_width;
uniform float clip_x0;
uniform float clip_y0;
uniform float clip_width;
uniform float clip_height;
uniform float scale_factor;

varying vec2 vUv;

// Overall bend multiplier and edge-profile curve (< 1 reaches further inward).
const float BEND_SCALE = 1.4;
const float BEND_CURVE = 0.7;
const float DISPERSION_RATIO = 0.9;
const float GLARE_TAPER_LEAD = 0.6;
const float GLARE_TAPER_TAIL = 1.0;
const float SPECULAR_FAR_SIDE = 0.6;
const float BORDER_FADE_LEAD = 45.0;
const float BORDER_FADE_TAIL = 8.0;

float quartzGlassEdgeProfile(float distanceFromEdge,
                             float refractionHeight) {
    float t = clamp(distanceFromEdge / max(refractionHeight, 0.001), 0.0, 1.0);
    return 1.0 - sqrt(t * (2.0 - t));
}

// 0.1.0b Snell-style displacement profile
float surfaceConvexSquircle(float x) {
    return pow(1.0 - pow(1.0 - x, 4.0), 0.25);
}

vec2 snellRefractRay(vec2 normal, float eta) {
    float cosI = -normal.y;
    float k = 1.0 - eta * eta * (1.0 - cosI * cosI);
    if (k < 0.0) return vec2(0.0);
    float sq = sqrt(k);
    return vec2(-(eta * cosI + sq) * normal.x,
                eta - (eta * cosI + sq) * normal.y);
}

float snellRawRefraction(float br, float gt, float bw, float eta) {
    float x = clamp(br, 0.05, 0.95);
    float y = surfaceConvexSquircle(x);
    float y2 = surfaceConvexSquircle(x + 0.001);
    float d = (y2 - y) / 0.001;
    float m = sqrt(d * d + 1.0);
    vec2 n = vec2(-d / m, -1.0 / m);
    vec2 r = snellRefractRay(n, eta);
    if (length(r) < 0.0001 || abs(r.y) < 0.0001) return 0.0;
    return r.x * (y * bw + gt) / r.y;
}

float snellDisplacementAtRatio(float br, float gt, float bw, float eta) {
    float peak = snellRawRefraction(0.05, gt, bw, eta);
    if (abs(peak) < 0.0001) return 0.0;
    float raw = snellRawRefraction(br, gt, bw, eta);
    return (raw / peak) * (1.0 - smoothstep(0.0, 1.0, br));
}

float quartzGlassRing(float distanceFromEdge,
                      float bezelWidth,
                      float widthScale) {
    float ringWidth = clamp(bezelWidth * 0.24 * fresnel_width, 1.0,
                            2.5 * fresnel_width) * widthScale;
    if (ringWidth <= 0.001) return 0.0;
    float aa = 1.0;

    float outerCoverage = clamp(distanceFromEdge / aa + 0.5, 0.0, 1.0);
    float innerCoverage = clamp((ringWidth - distanceFromEdge) / aa + 0.5, 0.0, 1.0);
    float radial = clamp(distanceFromEdge / ringWidth, 0.0, 1.0);
    return outerCoverage * innerCoverage * (1.0 - radial);
}

float quartzGlassHighlight(float distanceFromEdge,
                           float bezelWidth,
                           float taper,
                           float s) {
    float highlight = quartzGlassRing(distanceFromEdge, bezelWidth, taper) *
                      sqrt(taper);

    float oppositeAttenuation = 1.35;
    highlight /= max(1.0 + (1.0 - highlight) * oppositeAttenuation,
                     0.0001);
    return highlight * max(s, 0.0);
}

float luminance(vec3 color) {
    return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec2 clampUV(vec2 uv) {
    vec2 px = vec2(1.5 / width, 1.5 / height);
    return clamp(uv, px, vec2(1.0) - px);
}

vec2 resolveUV(vec2 uv) {
    return clampUV(uv);
}

vec4 sampleBackdrop(vec2 uv) {
    return texture2D(tex, resolveUV(uv));
}

vec4 sampleGlassBackdrop(vec2 uv) {
    vec4 sampleColor = sampleBackdrop(uv);
    return vec4(sampleColor.a > 0.0001 ? sampleColor.rgb / sampleColor.a : vec3(0.0), sampleColor.a);
}

float roundedBoxDistance(vec2 p, vec2 halfSize, float radius) {
    radius = min(radius, min(halfSize.x, halfSize.y));
    vec2 q = abs(p) - halfSize + vec2(radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float edgeCoverage(float signedDistance, vec2 position, vec2 normal) {
    float antialiasWidth = max(aa_width, 0.0001);
    return 1.0 - smoothstep(
        -antialiasWidth * 0.5,
        antialiasWidth * 0.5,
        signedDistance
    );
}

struct EdgeInfo {
    float distance;
    float alpha;
    vec2 dir;
};

EdgeInfo estimateAnalyticEdge(vec2 px, vec2 halfSize, float radius, vec2 actorPosition) {
    vec2 p = px - halfSize;
    vec2 core = max(halfSize - vec2(radius), vec2(0.0));
    float signedDistance = roundedBoxDistance(p, halfSize, radius);

    EdgeInfo info;
    info.distance = max(0.0, -signedDistance);

    vec2 nearestCore = clamp(p, -core, core);
    vec2 normalDelta = p - nearestCore;

    float normalLength = length(normalDelta);

    if (normalLength > 0.001) {
        info.dir = normalDelta / normalLength;
    } else {
        vec2 lensPx = px;
        float dL = lensPx.x;
        float dR = halfSize.x * 2.0 - lensPx.x;
        float dT = lensPx.y;
        float dB = halfSize.y * 2.0 - lensPx.y;
        float dm = min(min(dL, dR), min(dT, dB));

        info.dir = vec2(
            (dL < dR && dL == dm) ? -1.0 : (dR <= dL && dR == dm) ? 1.0 : 0.0,
            (dT < dB && dT == dm) ? -1.0 : (dB <= dT && dB == dm) ? 1.0 : 0.0
        );
    }

    info.alpha = edgeCoverage(signedDistance, actorPosition, info.dir);
    return info;
}

vec2 sharpCornerDir(vec2 glassPx, vec2 glassSize, float band) {
    vec2 sideDistances = min(glassPx, glassSize - glassPx);
    vec2 sideWeights = vec2(1.0) - smoothstep(vec2(0.0), vec2(band), sideDistances);
    vec2 sideNormal = sign(glassPx - glassSize * 0.5) * sideWeights;
    return sideNormal / max(length(sideNormal), 0.0001);
}

vec3 bandEdge(vec2 glassPx, vec2 halfSize, float radius, float band,
              float fallbackDistance, vec2 fallbackDir) {
    vec2 p = glassPx - halfSize;
    vec2 core = max(halfSize - vec2(band), vec2(0.0));
    vec2 delta = max(abs(p) - core, vec2(0.0));
    float r = length(delta);
    if (r < 0.001)
        return vec3(fallbackDistance, fallbackDir);

    vec2 ray = delta / r;
    vec2 sideHits = (halfSize - core) / max(ray, vec2(0.0001));
    float edgeHit = min(sideHits.x, sideHits.y);
    vec2 arcCenter = halfSize - vec2(radius);
    vec2 hit = core + ray * edgeHit;
    if (hit.x > arcCenter.x && hit.y > arcCenter.y) {
        vec2 fromArc = core - arcCenter;
        float b = dot(fromArc, ray);
        edgeHit = -b + sqrt(max(b * b - dot(fromArc, fromArc) + radius * radius, 0.0));
    }
    return vec3(max(edgeHit - r, 0.0), sign(p) * ray);
}

// Note: displacementPx is top-down (y+ down); convert y sign for WebGL vUv (v+ up)
vec2 backdropSampleUV(vec2 sampleUV, vec2 displacementPx) {
    vec2 displaced = sampleUV + vec2(displacementPx.x / width, -displacementPx.y / height);
    float zoom = max(backdrop_zoom, 0.01);

    displaced = vec2(0.5) + (displaced - vec2(0.5)) / zoom;
    return displaced;
}

vec4 sampleDispersed(vec2 sampleUV, vec2 dispPx, vec2 aberrationPx,
                     float dispersion) {
    vec2 greenUV = backdropSampleUV(sampleUV, dispPx);
    vec4 greenSample = sampleGlassBackdrop(greenUV);

    vec4 fallback = vec4(0.0);
    if (greenSample.a < 0.01) {
        fallback = sampleGlassBackdrop(sampleUV);
        if (fallback.a < 0.01)
            return vec4(0.0);
        greenSample = fallback;
    }

    vec4 bg = greenSample;
    if (dispersion > 0.001 && dot(dispPx, dispPx) > 0.0001) {
        vec3 accumulated = vec3(0.0);
        float accumulatedAlpha = 0.0;

        for (int i = 0; i < 3; i++) {
            float weight = 1.0 - float(i) / 3.0;
            vec2 uv = backdropSampleUV(sampleUV,
                                       dispPx + aberrationPx * weight);
            vec4 smp = sampleGlassBackdrop(uv);
            if (smp.a < 0.01)
                smp = fallback;
            accumulated.r += smp.r * weight;
            accumulated.g += smp.g * (1.0 - weight);
            accumulatedAlpha += smp.a;
        }

        for (int i = 0; i < 4; i++) {
            float weight = float(i) / 3.0;
            vec2 uv = backdropSampleUV(sampleUV,
                                       dispPx - aberrationPx * weight);
            vec4 smp = sampleGlassBackdrop(uv);
            if (smp.a < 0.01)
                smp = fallback;
            accumulated.g += smp.g * (1.0 - weight);
            accumulated.b += smp.b * weight;
            accumulatedAlpha += smp.a;
        }

        bg.rgb = accumulated * vec3(0.5, 1.0 / 3.0, 0.5);
        bg.a = accumulatedAlpha / 7.0;
    }
    return bg;
}

vec4 edgeGlowColor(vec2 sampleUV, vec2 dir, float band) {
    vec3 gathered = vec3(0.0);
    for (int i = 1; i <= 3; i++) {
        vec2 inwardPx = -dir * band * float(i) * 0.6;
        gathered += sampleGlassBackdrop(backdropSampleUV(sampleUV, inwardPx)).rgb;
    }
    gathered /= 3.0;

    float maxC = max(gathered.r, max(gathered.g, gathered.b));
    float minC = min(gathered.r, min(gathered.g, gathered.b));
    float chroma = maxC - minC;
    vec3 vivid = chroma > 0.001
        ? (gathered - vec3(minC)) / chroma * maxC
        : gathered;
    return vec4(vivid, smoothstep(0.06, 0.4, chroma));
}

vec3 applyTintAndShadow(vec3 smp, vec2 localUV) {
    vec3 tintColor = vec3(tint_r, tint_g, tint_b);
    vec3 outRGB = mix(smp, tintColor, tint * tint_a);

    outRGB *= 1.0 - smoothstep(0.25, 1.0, localUV.y) * shadow * 0.20;

    return clamp(outRGB, 0.0, 1.0);
}

void main() {
    vec2 actorSize = vec2(width, height);
    vec2 actorUV = vUv;

    vec2 actorPx = vec2(actorUV.x * width, (1.0 - actorUV.y) * height);
    vec4 bounds = clip_width < 0.0 || clip_height < 0.0
        ? vec4(0.0, 0.0, width, height)
        : vec4(clip_x0, clip_y0, clip_x0 + clip_width, clip_y0 + clip_height);

    vec2 glassSize = max(bounds.zw - bounds.xy, vec2(1.0));
    vec2 glassPx = actorPx - bounds.xy;
    vec2 halfSize = glassSize * 0.5;
    vec2 localUV = glassPx / glassSize;

    float W = glassSize.x;
    float H = glassSize.y;
    float shortestSide = min(W, H);
    float R = clamp(corner_radius, 0.0, shortestSide * 0.5);
    float roundingRadius = R;
    if ((glassPx.y < H * 0.5 && corners_top == 0)
        || (glassPx.y >= H * 0.5 && corners_bottom == 0))
        roundingRadius = 0.0;
    float bezel = max(1.0, min(edge_size, shortestSide * 0.5));
    float glassThickness = max(0.5, edge_size * 0.55 * falloff);

    bool nearlySquare = abs(W - H) < max(4.0, shortestSide * 0.035);
    bool useCircularSurface = corners_top != 0 && corners_bottom != 0
        && nearlySquare && R >= shortestSide * 0.5 - 0.5;

    EdgeInfo edge = estimateAnalyticEdge(glassPx, halfSize, roundingRadius, actorPx);
    if (edge.alpha <= 0.0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    float distFromSide = edge.distance;
    float edgeOpacity = edge.alpha;
    float refractionBand = bezel;
    vec2 dir = edge.dir;

    if (useCircularSurface) {
        float circleRadius = shortestSide * 0.5;
        vec2 circleCenter = glassSize * 0.5;
        vec2 fromCenter = glassPx - circleCenter;
        float circleDistance = length(fromCenter);

        if (circleDistance > circleRadius + 1.0) {
            gl_FragColor = vec4(0.0);
            return;
        }

        distFromSide = max(0.0, circleRadius - circleDistance);
        dir = circleDistance > 0.001 ? normalize(fromCenter) : vec2(0.0, -1.0);
        edgeOpacity = edgeCoverage(circleDistance - circleRadius, actorPx, dir);

        float rimRadius = max(1.0, bezel * 0.35);
        refractionBand = rimRadius;
    } else {
        float rimRadius = max(1.0, bezel * 0.35 * max(1.0, rim_width));
        rimRadius = min(rimRadius, shortestSide * 0.5);
        if (R > 0.0 && (corners_top != 0 || corners_bottom != 0))
            rimRadius = min(rimRadius, max(1.0, R));
        refractionBand = rimRadius;
        if (roundingRadius == 0.0 && distFromSide < refractionBand)
            dir = sharpCornerDir(glassPx, glassSize, refractionBand);
    }

    float lensBand = max(refractionBand, min(reach, shortestSide * 0.5));
    float lensThickness = glassThickness * lensBand / refractionBand;
    float lensDist = distFromSide;
    vec2 lensDir = dir;
    if (!useCircularSurface && lensBand > refractionBand && distFromSide < lensBand) {
        if (roundingRadius == 0.0) {
            lensDir = sharpCornerDir(glassPx, glassSize, lensBand);
        } else {
            vec3 lensEdge = bandEdge(glassPx, halfSize, roundingRadius,
                                     max(roundingRadius, lensBand),
                                     distFromSide, dir);
            lensDist = lensEdge.x;
            lensDir = lensEdge.yz;
        }
    }
    float edgeBand = clamp(1.0 - (lensDist / lensBand), 0.0, 1.0);

    if (!useCircularSurface && (roundingRadius == 0.0 || R < shortestSide * 0.45)
        && distFromSide >= lensBand) {
        vec4 sourceSample = sampleGlassBackdrop(actorUV);
        vec2 flatUV = backdropSampleUV(actorUV, vec2(0.0));
        vec4 flatSample = sampleGlassBackdrop(flatUV);
        float finalOpacity = edgeOpacity * mix(sourceSample.a, flatSample.a,
                                               opacity_factor);
        vec3 effectRGB = applyTintAndShadow(flatSample.rgb, localUV);
        vec3 outRGB = mix(sourceSample.rgb, effectRGB, opacity_factor);

        gl_FragColor = vec4(outRGB, finalOpacity);
        return;
    }

    float normDisp = lensDist < lensBand
        ? pow(max(quartzGlassEdgeProfile(lensDist,
                                         max(lensThickness, 1.0)), 0.0),
              BEND_CURVE)
        : 0.0;
    if (refraction_style > 0.001) {
        float bezelRatio = clamp(lensDist / max(lensBand, 0.001), 0.0, 1.0);
        float eta = 1.0 / 1.5;
        float snellDisp = (lensDist < lensBand)
            ? snellDisplacementAtRatio(bezelRatio, max(1.0, lensThickness),
                                       max(1.0, lensBand), eta)
            : 0.0;
        normDisp = mix(normDisp, snellDisp, clamp(refraction_style, 0.0, 1.0));
    }
    float dispStrength = edgeBand;
    vec2 dispPx = -lensDir * normDisp * lensBand * strength * dispStrength *
                  BEND_SCALE;

    float dispersion = clamp(rgb_fringing, 0.0, 1.0) * DISPERSION_RATIO;
    vec4 sourceColor = sampleGlassBackdrop(actorUV);
    vec2 aberrationPx = dispPx * clamp(normDisp, 0.0, 1.0) * dispersion;
    vec4 bgColor = sampleDispersed(actorUV, dispPx, aberrationPx, dispersion);

    vec3 outRGB = mix(bgColor.rgb, vec3(tint_r, tint_g, tint_b),
                      tint * tint_a);

    vec2 glareAxis = vec2(cos(fresnel_angle), sin(fresnel_angle));
    float glareAxisDot = dot(glareAxis, dir);
    float glareFacing = abs(glareAxisDot);

    bool glareVertical = abs(glareAxis.y) >= abs(glareAxis.x);
    vec2 rimP = abs(glassPx - halfSize);
    vec2 straightHalf = max(halfSize - vec2(roundingRadius), vec2(0.0));
    vec2 litP = glareVertical ? rimP : rimP.yx;
    vec2 litStraight = glareVertical ? straightHalf : straightHalf.yx;
    vec2 litDir = glareVertical ? abs(dir) : abs(dir).yx;
    float rimPos = roundingRadius * atan(litDir.x, max(litDir.y, 0.0001)) +
                   min(litP.x - litStraight.x, 0.0) +
                   max(litStraight.y - litP.y, 0.0);

    float taperR = max(roundingRadius, 4.0);
    float glareLead = min(GLARE_TAPER_LEAD * taperR, litStraight.x);
    float glareTail = min(GLARE_TAPER_TAIL * taperR, litStraight.y);
    float glareTaper = 1.0 - smoothstep(-glareLead,
                                        roundingRadius * 1.5707963 + glareTail +
                                        0.001,
                                        rimPos);
    float offAxis = clamp((1.0 - max(abs(glareAxis.x), abs(glareAxis.y))) /
                          0.2928932, 0.0, 1.0);
    glareTaper = mix(glareTaper, glareFacing, offAxis);

    if (fresnel_two_sided == 0) {
        float oneSidedMask = 1.0 - smoothstep(-0.2, 0.1, glareAxisDot);
        glareTaper *= oneSidedMask;
    }

    if (edge_shadow > 0.001) {
        float scale = max(scale_factor, 1.0);
        float borderTaper = step(0.5, litDir.x) *
                            smoothstep(glareTail - BORDER_FADE_LEAD * scale,
                                       glareTail + BORDER_FADE_TAIL * scale,
                                       litStraight.y - litP.y);
        float lineWidth = clamp(refractionBand * 0.02, 0.5 * scale,
                                1.0 * scale) * borderTaper;
        float line = 1.0 - smoothstep(lineWidth - 0.5, lineWidth + 0.5,
                                      distFromSide);

        float darken = edge_shadow * line * borderTaper *
                       mix(0.5, 1.0, luminance(outRGB));
        outRGB *= 1.0 - darken;
    }

    float glowWidth = max(1.5, refractionBand * 0.6);
    if (edge_glow > 0.001 && distFromSide < glowWidth) {
        float glowBand = 1.0 - smoothstep(0.0, glowWidth, distFromSide);
        vec4 glow = edgeGlowColor(actorUV, dir, refractionBand);
        float glowAmount = glowBand * glowBand * glow.a * edge_glow * 0.85;
        outRGB = mix(outRGB, clamp(glow.rgb * 1.15, 0.0, 1.0), glowAmount);
    }

    float highlight = quartzGlassHighlight(distFromSide, refractionBand,
                                           glareTaper, gloss) *
                      edgeOpacity;
    float bgLuminance = luminance(outRGB);
    highlight *= mix(0.32, 1.0, bgLuminance);
    highlight = min(highlight, 0.35);
    outRGB = 1.0 - (1.0 - outRGB) * (1.0 - highlight);

    outRGB *= 1.0 - smoothstep(0.25, 1.0, localUV.y) * shadow * 0.20;

    if (specular_strength > 0.001) {
        float side = glareAxisDot < 0.0 ? 1.0 : SPECULAR_FAR_SIDE;
        float core = quartzGlassRing(distFromSide, refractionBand, glareTaper) *
                     sqrt(glareTaper);
        float bloomWidth = max(1.5, refractionBand * 0.25);
        float bloom = exp(-distFromSide / bloomWidth) * 0.35 *
                      glareTaper * glareTaper;
        float specular = (core + bloom) * side * edgeOpacity *
                         specular_strength;
        specular = clamp(specular, 0.0, 0.85);
        outRGB = 1.0 - (1.0 - clamp(outRGB, 0.0, 1.0)) * (1.0 - specular);
    }

    outRGB = mix(sourceColor.rgb, outRGB, opacity_factor);
    float finalOpacity = edgeOpacity * mix(sourceColor.a, bgColor.a,
                                           opacity_factor);

    gl_FragColor = vec4(clamp(outRGB, 0.0, 1.0), finalOpacity);
}
`;

// Exact system CONFIG schema from Liquid Vapor Glass, tuned cleanly for 48x48 circular buttons
export const CONFIG = {
    flow: {
        enabled: true,
        speed: 0.75,
        maxFps: 30,
    },
    surfaces: {
        favoriteButton: {
            enabled: true,
            vapor: {
                frequency: 0.5,
                amplitude: 0.14,
                octaves: 2,
                vapor_octaves: 4,
                vapor_speed: 1.5,
                grain: 0.0, // No blur / no noise grain
                zoom: 1.08,
                dispersion: 0.22,
                saturation: 1.05,
                brightness: 1.0,
                water_amplitude: 3.2,
                water_wavelength: 44, // Scaled from dock's 110px to fit 48px circular crystal lens
                water_caustics: 0.75,
            },
            glass: {
                strength: 1.15,
                edge_size: 24,
                falloff: 1.25,
                refraction_style: 0.35,
                corner_radius: 24,
                corners_top: 1,
                corners_bottom: 1,
                rim_width: 4.8,
                reach: 14,
                rgb_fringing: 0.28,
                gloss: 1.0,
                fresnel_width: 1.5,
                fresnel_two_sided: 1,
                specular_strength: 0.25,
                edge_shadow: 0.7,
                edge_glow: 0.55,
                tint: 0.06,
                backdrop_zoom: 1.0,
                shadow: 0.3,
                opacity_factor: 1.0,
                fresnel_angle: 1.5707963267948966,
                tint_r: 0.48,
                tint_g: 0.48,
                tint_b: 0.48,
                tint_a: 1.0,
            },
        },
    },
};

const INT_UNIFORMS = new Set([
    'octaves', 'vapor_octaves', 'corners_top', 'corners_bottom', 'fresnel_two_sided',
]);

function setUniform(uniforms, name, value) {
    if (!uniforms[name]) return;
    if (INT_UNIFORMS.has(name)) {
        uniforms[name].value = Math.trunc(value);
    } else {
        uniforms[name].value = parseFloat(value) - 1e-6;
    }
}

const FULLSCREEN_VERT = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// One shared ticker drives every animated favorite button (mirrors FlowTicker in extension.js)
class FlowTicker {
    static _tasks = new Set();
    static _rafId = null;
    static _timerId = null;
    static _lastTime = 0;
    static _isSoftwareGl = false;
    static _afterDrawFn = null;

    static configure(isSoftwareGl, afterDrawFn) {
        this._isSoftwareGl = isSoftwareGl;
        this._afterDrawFn = afterDrawFn;
    }

    static add(task) {
        this._tasks.add(task);
        if (this._rafId !== null || this._timerId !== null)
            return;

        this._lastTime = performance.now();
        this._schedule();
    }

    static remove(task) {
        if (!this._tasks.delete(task) || this._tasks.size > 0)
            return;

        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
        if (this._timerId !== null) {
            window.clearTimeout(this._timerId);
            this._timerId = null;
        }
    }

    static _schedule() {
        if (this._tasks.size === 0)
            return;

        if (this._isSoftwareGl && this._afterDrawFn) {
            this._timerId = this._afterDrawFn(this._onFrame);
        } else {
            this._rafId = requestAnimationFrame(this._onFrame);
        }
    }

    static _onFrame = () => {
        this._rafId = null;
        this._timerId = null;

        const now = performance.now();
        const deltaMs = Math.min(60, Math.max(1, now - this._lastTime));
        this._lastTime = now;

        for (const tick of this._tasks) {
            tick(deltaMs);
        }

        this._schedule();
    };
}

// Pass 1 controller: wave + vapor + water shader uniforms & geometry
class VaporWaveEffect {
    constructor(configUniforms) {
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tex: { value: null },
                has_backdrop_tex: { value: 0 },
                card_uv_center: { value: new THREE.Vector2(0.5, 0.5) },
                card_uv_span: { value: new THREE.Vector2(0.15, 0.15) },
                is_dark_theme: { value: 0 },
                width: { value: 48 },
                height: { value: 48 },
                surface_max_size: { value: 48 },
                clip_x0: { value: 0 },
                clip_y0: { value: 0 },
                clip_width: { value: -1 },
                clip_height: { value: -1 },
                frequency: { value: 0.5 },
                amplitude: { value: 0.1 },
                octaves: { value: 2 },
                vapor_octaves: { value: 4 },
                vapor_speed: { value: 1.5 },
                grain: { value: 0.0 },
                zoom: { value: 1.0 },
                dispersion: { value: 0.2 },
                saturation: { value: 1.0 },
                brightness: { value: 1.0 },
                water_amplitude: { value: 3.0 },
                water_wavelength: { value: 44.0 },
                water_caustics: { value: 0.7 },
                time: { value: 0.0 },
            },
            vertexShader: FULLSCREEN_VERT,
            fragmentShader: VAPOR_GLSL,
            depthTest: false,
            depthWrite: false,
        });

        for (const [name, value] of Object.entries(configUniforms)) {
            setUniform(this.material.uniforms, name, value);
        }
    }

    setGeometry(width, height) {
        const u = this.material.uniforms;
        setUniform(u, 'width', width);
        setUniform(u, 'height', height);
        setUniform(u, 'surface_max_size', Math.max(width, height));
    }

    updatePhase(phase) {
        setUniform(this.material.uniforms, 'time', phase);
    }
}

// Pass 2 controller: liquid glass edge refraction, chromatic dispersion, rim light
class LiquidGlassEffect {
    constructor(configUniforms, inputTexture) {
        this._u = configUniforms;
        this._width = 48;
        this._height = 48;
        this._scale = 1;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                tex: { value: inputTexture },
                width: { value: 48 },
                height: { value: 48 },
                strength: { value: 1 },
                edge_size: { value: 24 },
                falloff: { value: 1.25 },
                refraction_style: { value: 0.35 },
                corner_radius: { value: 24 },
                corners_top: { value: 1 },
                corners_bottom: { value: 1 },
                rim_width: { value: 4.8 },
                reach: { value: 14 },
                rgb_fringing: { value: 0.28 },
                gloss: { value: 1 },
                fresnel_angle: { value: 1.5707963267948966 },
                fresnel_width: { value: 1.5 },
                fresnel_two_sided: { value: 1 },
                specular_strength: { value: 0.25 },
                edge_shadow: { value: 0.7 },
                edge_glow: { value: 0.55 },
                tint: { value: 0.06 },
                tint_r: { value: 0.48 },
                tint_g: { value: 0.48 },
                tint_b: { value: 0.48 },
                tint_a: { value: 1.0 },
                backdrop_zoom: { value: 1.0 },
                shadow: { value: 0.3 },
                opacity_factor: { value: 1.0 },
                aa_width: { value: 1.0 },
                clip_x0: { value: 0 },
                clip_y0: { value: 0 },
                clip_width: { value: -1 },
                clip_height: { value: -1 },
                scale_factor: { value: 1.0 },
            },
            vertexShader: FULLSCREEN_VERT,
            fragmentShader: GLASS_GLSL,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        for (const [name, value] of Object.entries(configUniforms)) {
            if (name !== 'edge_size' && name !== 'reach' && name !== 'corner_radius') {
                setUniform(this.material.uniforms, name, value);
            }
        }
        this._applyScaled();
    }

    setGeometry(width, height, scale, aaWidth) {
        this._width = width;
        this._height = height;
        this._scale = scale;
        const u = this.material.uniforms;
        setUniform(u, 'width', width);
        setUniform(u, 'height', height);
        setUniform(u, 'aa_width', aaWidth);
        this._applyScaled();
    }

    _applyScaled() {
        const u = this.material.uniforms;
        const maxEdge = Math.max(1, Math.min(this._width, this._height) / 2);
        setUniform(u, 'edge_size', Math.min(this._u.edge_size * this._scale, maxEdge));
        setUniform(u, 'reach', Math.min(this._u.reach * this._scale, maxEdge));
        setUniform(u, 'corner_radius', Math.min(this._u.corner_radius * this._scale, maxEdge));
        setUniform(u, 'scale_factor', this._scale);
    }
}

// GlassSurface manages the shared WebGL pipeline and syncs each favorite button's backdrop UV slice
class FavoriteGlassPipeline {
    constructor() {
        this._renderer = null;
        this._waveTarget = null;
        this._camera = null;
        this._vapor = null;
        this._glassFx = null;
        this._waveScene = null;
        this._glassScene = null;
        this._surfaces = new Map();
        this._textureCache = new Map();
        this._nextId = 1;
        this._renderSize = 96;
        this._isSoftwareGl = false;
    }

    _ensureInit() {
        if (this._renderer) return true;
        if (typeof document === 'undefined') return false;

        try {
            const probeCanvas = document.createElement('canvas');
            const probeGl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
            if (!probeGl) return false;

            const dbg = probeGl.getExtension('WEBGL_debug_renderer_info');
            const param = dbg ? dbg.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
            const gpuName = String(probeGl.getParameter(param) || '');
            probeGl.getExtension('WEBGL_lose_context')?.loseContext();
            this._isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuName);

            const canvas = document.createElement('canvas');

            const renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: !this._isSoftwareGl,
                powerPreference: 'high-performance',
                premultipliedAlpha: false,
            });
            renderer.outputColorSpace = THREE.NoColorSpace;
            renderer.toneMapping = THREE.NoToneMapping;
            renderer.setPixelRatio(1);
            renderer.setSize(this._renderSize, this._renderSize, false);
            renderer.setClearColor(0x000000, 0);

            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            const geometry = new THREE.PlaneGeometry(2, 2);

            const waveTarget = new THREE.WebGLRenderTarget(this._renderSize, this._renderSize, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: THREE.UnsignedByteType,
                depthBuffer: false,
                stencilBuffer: false,
            });

            const cfg = CONFIG.surfaces.favoriteButton;
            const vapor = new VaporWaveEffect(cfg.vapor);
            const glassFx = new LiquidGlassEffect(cfg.glass, waveTarget.texture);

            const waveScene = new THREE.Scene();
            waveScene.add(new THREE.Mesh(geometry, vapor.material));

            const glassScene = new THREE.Scene();
            glassScene.add(new THREE.Mesh(geometry, glassFx.material));

            if (!this._isSoftwareGl) {
                renderer.compile(waveScene, camera);
                renderer.compile(glassScene, camera);
            }

            this._renderer = renderer;
            this._waveTarget = waveTarget;
            this._camera = camera;
            this._vapor = vapor;
            this._glassFx = glassFx;
            this._waveScene = waveScene;
            this._glassScene = glassScene;

            FlowTicker.configure(this._isSoftwareGl, (cb) => {
                const gl = renderer.getContext();
                if (!gl || !gl.fenceSync) {
                    return window.setTimeout(cb, 80);
                }
                const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
                gl.flush();
                let tid = 0;
                const poll = () => {
                    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
                    if (state === gl.UNSIGNALED) {
                        tid = window.setTimeout(poll, 5);
                    } else {
                        if (sync) gl.deleteSync(sync);
                        window.setTimeout(cb, 80);
                    }
                };
                tid = window.setTimeout(poll, 5);
                return tid;
            });

            return true;
        } catch {
            return false;
        }
    }

    _getOrCreateTexture(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return null;
        const key = img.currentSrc || img.src;
        if (!key) return null;

        const existing = this._textureCache.get(key);
        if (existing) return existing;

        const tex = new THREE.Texture(img);
        tex.colorSpace = THREE.NoColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        if (this._renderer) {
            tex.anisotropy = this._renderer.capabilities.getMaxAnisotropy();
        }
        tex.needsUpdate = true;
        this._textureCache.set(key, tex);
        return tex;
    }

    _syncBackdropRect(img, btnEl) {
        const imgRect = img.getBoundingClientRect();
        const btnRect = btnEl.getBoundingClientRect();

        if (imgRect.width <= 1 || imgRect.height <= 1 || btnRect.width <= 1 || btnRect.height <= 1) {
            return null;
        }

        const natW = img.naturalWidth || imgRect.width;
        const natH = img.naturalHeight || imgRect.height;
        const natAspect = natW / natH;
        const boxAspect = imgRect.width / imgRect.height;

        let visUMin = 0;
        let visUMax = 1;
        let visVMin = 0;
        let visVMax = 1;

        if (natAspect > boxAspect) {
            const frac = boxAspect / natAspect;
            visUMin = 0.5 - frac * 0.5;
            visUMax = 0.5 + frac * 0.5;
        } else if (natAspect < boxAspect) {
            const frac = natAspect / boxAspect;
            visVMin = 0.5 - frac * 0.5;
            visVMax = 0.5 + frac * 0.5;
        }

        const rx0 = (btnRect.left - imgRect.left) / imgRect.width;
        const rx1 = (btnRect.right - imgRect.left) / imgRect.width;
        const ry0 = (btnRect.top - imgRect.top) / imgRect.height;
        const ry1 = (btnRect.bottom - imgRect.top) / imgRect.height;

        const uLeft = visUMin + rx0 * (visUMax - visUMin);
        const uRight = visUMin + rx1 * (visUMax - visUMin);
        const vTop = visVMax - ry0 * (visVMax - visVMin);
        const vBot = visVMax - ry1 * (visVMax - visVMin);

        return {
            centerX: (uLeft + uRight) * 0.5,
            centerY: (vBot + vTop) * 0.5,
            spanX: Math.max(0.001, uRight - uLeft),
            spanY: Math.max(0.001, vTop - vBot),
        };
    }

    register(surface) {
        if (!this._ensureInit()) return -1;

        const id = this._nextId++;
        const state = {
            ...surface,
            id,
            phase: (id * 1.17) % TAU,
            sinceRepaint: 1000 / CONFIG.flow.maxFps, // paint immediately on first frame
            hoverSmoothed: 0,
            savedSmoothed: surface.isSaved() ? 1 : 0,
            pointerSmoothedX: 0,
        };

        state.tick = (deltaMs) => this._tickSurface(state, deltaMs);
        this._surfaces.set(id, state);
        FlowTicker.add(state.tick);
        return id;
    }

    unregister(id) {
        const state = this._surfaces.get(id);
        if (!state) return;
        FlowTicker.remove(state.tick);
        this._surfaces.delete(id);
    }

    _tickSurface(state, deltaMs) {
        if (!state.isVisible()) return;

        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

        const dt = deltaMs / 1000;
        state.hoverSmoothed = THREE.MathUtils.damp(state.hoverSmoothed, state.isHovered() ? 1 : 0, 10, dt);
        state.savedSmoothed = THREE.MathUtils.damp(state.savedSmoothed, state.isSaved() ? 1 : 0, 10, dt);
        const rawPtr = state.getPointer();
        state.pointerSmoothedX = THREE.MathUtils.damp(state.pointerSmoothedX, rawPtr.x, 12, dt);

        if (CONFIG.flow.enabled && CONFIG.flow.speed > 0 && !prefersReduced) {
            const speedBoost = 1 + 0.65 * state.hoverSmoothed;
            state.phase = (state.phase + deltaMs * TIME_FACTOR * CONFIG.flow.speed * speedBoost) % TAU;
        }

        state.sinceRepaint += deltaMs;
        const interval = 1000 / CONFIG.flow.maxFps;
        if (state.sinceRepaint < interval) return;
        state.sinceRepaint %= interval;

        this._renderSurface(state, prefersReduced);
    }

    _renderSurface(state, prefersReduced) {
        const btnEl = state.getButtonElement();
        const targetCanvas = state.displayCanvas;
        const ctx = targetCanvas?.getContext('2d');
        if (!ctx || !btnEl || !this._renderer) return;

        const dpr = this._isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
        const cssW = btnEl.clientWidth || 48;
        const cssH = btnEl.clientHeight || 48;
        const targetW = Math.round(cssW * dpr);
        const targetH = Math.round(cssH * dpr);

        if (targetCanvas.width !== targetW || targetCanvas.height !== targetH) {
            targetCanvas.width = targetW;
            targetCanvas.height = targetH;
        }

        const srcImg = state.getSourceImage();
        const tex = srcImg ? this._getOrCreateTexture(srcImg) : null;
        const uvRect = tex && srcImg ? this._syncBackdropRect(srcImg, btnEl) : null;

        const cfg = CONFIG.surfaces.favoriteButton;
        const clickPulse = prefersReduced ? 0 : state.getClickPulse();
        const clickWave = clickPulse > 0 ? Math.sin(clickPulse * Math.PI) : 0;

        // Pass 1: VaporWaveEffect
        const wU = this._vapor.material.uniforms;
        wU.tex.value = tex;
        wU.has_backdrop_tex.value = tex && uvRect ? 1.0 : 0.0;
        if (uvRect) {
            wU.card_uv_center.value.set(uvRect.centerX, uvRect.centerY);
            wU.card_uv_span.value.set(uvRect.spanX, uvRect.spanY);
        } else {
            wU.card_uv_center.value.set(0.5, 0.5);
            wU.card_uv_span.value.set(0.25, 0.25);
        }
        wU.is_dark_theme.value = state.getThemeMode() === 'dark' ? 1.0 : 0.0;

        this._vapor.setGeometry(cssW, cssH);
        this._vapor.updatePhase(state.phase);
        setUniform(wU, 'water_amplitude', cfg.vapor.water_amplitude + 1.2 * state.hoverSmoothed + 2.2 * clickWave);
        setUniform(wU, 'zoom', cfg.vapor.zoom + 0.06 * state.hoverSmoothed);

        // Pass 2: LiquidGlassEffect
        const gU = this._glassFx.material.uniforms;
        this._glassFx.setGeometry(cssW, cssH, 1.0, 1.0 / dpr);
        setUniform(gU, 'strength', cfg.glass.strength + 0.2 * state.hoverSmoothed + 0.35 * clickWave);
        setUniform(gU, 'rgb_fringing', cfg.glass.rgb_fringing + 0.14 * state.hoverSmoothed + 0.2 * clickWave);
        setUniform(gU, 'specular_strength', cfg.glass.specular_strength + 0.25 * state.hoverSmoothed);
        setUniform(gU, 'fresnel_angle', cfg.glass.fresnel_angle + state.pointerSmoothedX * 0.55 * state.hoverSmoothed);
        setUniform(gU, 'edge_shadow', state.getTone() === 'surface' ? 0.72 : cfg.glass.edge_shadow);
        setUniform(gU, 'tint', cfg.glass.tint + 0.10 * state.savedSmoothed);
        setUniform(gU, 'tint_r', THREE.MathUtils.lerp(cfg.glass.tint_r, 0.98, state.savedSmoothed));
        setUniform(gU, 'tint_g', THREE.MathUtils.lerp(cfg.glass.tint_g, 0.26, state.savedSmoothed));
        setUniform(gU, 'tint_b', THREE.MathUtils.lerp(cfg.glass.tint_b, 0.42, state.savedSmoothed));

        try {
            this._renderer.setRenderTarget(this._waveTarget);
            this._renderer.clear();
            this._renderer.render(this._waveScene, this._camera);

            this._renderer.setRenderTarget(null);
            this._renderer.clear();
            this._renderer.render(this._glassScene, this._camera);
        } catch {
            wU.tex.value = null;
            wU.has_backdrop_tex.value = 0.0;
            this._renderer.setRenderTarget(this._waveTarget);
            this._renderer.clear();
            this._renderer.render(this._waveScene, this._camera);
            this._renderer.setRenderTarget(null);
            this._renderer.clear();
            this._renderer.render(this._glassScene, this._camera);
        }

        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(this._renderer.domElement, 0, 0, targetW, targetH);
    }
}

export const favoriteGlassPipeline = new FavoriteGlassPipeline();
