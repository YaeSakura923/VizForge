import type { ShaderPreset } from '../types';

export const SHADER_PRESETS: ShaderPreset[] = [
  {
    name: 'Phong Lighting',
    type: 'fragment',
    description: 'Classic Phong reflection model with ambient, diffuse, and specular terms',
    code: `// Phong Lighting Shader
uniform vec3 lightDir;
uniform vec3 viewDir;
uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(lightDir);
    vec3 V = normalize(viewDir);
    vec3 R = reflect(-L, N);

    // Ambient
    vec3 ambient = ambientColor;

    // Diffuse
    float diff = max(dot(N, L), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular
    float spec = pow(max(dot(V, R), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}`,
  },
  {
    name: 'PBR Metallic',
    type: 'fragment',
    description: 'Physically-based rendering with metallic-roughness workflow',
    code: `// PBR Metallic-Roughness Shader
uniform vec3 albedo;
uniform float metallic;
uniform float roughness;
uniform vec3 lightPos;

varying vec3 vNormal;
varying vec3 vPosition;

const float PI = 3.14159265359;

float D_GGX(vec3 N, vec3 H, float a) {
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;
    float denom = NdotH2 * (a2 - 1.0) + 1.0;
    return a2 / (PI * denom * denom);
}

vec3 F_Schlick(vec3 f0, vec3 H, vec3 V) {
    return f0 + (1.0 - f0) * pow(1.0 - max(dot(H, V), 0.0), 5.0);
}

float G_Smith(vec3 N, vec3 V, vec3 L, float a) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float k = (a + 1.0) * (a + 1.0) / 8.0;
    float Gv = NdotV / (NdotV * (1.0 - k) + k);
    float Gl = NdotL / (NdotL * (1.0 - k) + k);
    return Gv * Gl;
}

void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vPosition);
    vec3 L = normalize(lightPos - vPosition);
    vec3 H = normalize(V + L);

    vec3 F0 = mix(vec3(0.04), albedo, metallic);
    float a = roughness * roughness;

    vec3 Lo = vec3(0.0);
    // Compute Cook-Torrance BRDF
    float NDF = D_GGX(N, H, a);
    vec3 F = F_Schlick(F0, H, V);
    float G = G_Smith(N, V, L, a);

    vec3 numerator = NDF * F * G;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.001;
    vec3 specular = numerator / denominator;

    vec3 kS = F;
    vec3 kD = (vec3(1.0) - kS) * (1.0 - metallic);
    vec3 diffuse = kD * albedo / PI;

    float NdotL = max(dot(N, L), 0.0);
    Lo += (diffuse + specular) * NdotL;

    gl_FragColor = vec4(Lo, 1.0);
}`,
  },
  {
    name: 'Volume Rendering',
    type: 'custom',
    description: 'Direct volume rendering with ray-casting and transfer function',
    code: `// Volume Ray-casting Shader
uniform sampler3D volume;
uniform sampler1D transferFunc;
uniform vec3 cameraPos;
uniform vec3 volumeBounds[2];
uniform float samplingRate;
uniform float stepSize;

varying vec3 vRayOrigin;
varying vec3 vRayDir;

vec4 sampleVolume(vec3 pos) {
    float density = texture3D(volume, pos).r;
    return texture1D(transferFunc, density);
}

void main() {
    vec3 rayDir = normalize(vRayDir);
    vec3 rayPos = vRayOrigin;

    float tmin = 0.0;
    float tmax = 1000.0;

    // Ray-box intersection
    vec3 invDir = 1.0 / rayDir;
    vec3 t0 = (volumeBounds[0] - rayPos) * invDir;
    vec3 t1 = (volumeBounds[1] - rayPos) * invDir;
    vec3 ts = min(t0, t1);
    vec3 te = max(t0, t1);
    tmin = max(max(ts.x, ts.y), ts.z);
    tmax = min(min(te.x, te.y), te.z);

    if (tmin > tmax) discard;

    // Front-to-back compositing
    vec4 color = vec4(0.0);
    float alpha = 0.0;
    float total = 0.0;
    vec3 pos = rayPos + tmin * rayDir;
    float dist = tmax - tmin;

    for (float t = 0.0; t < dist; t += stepSize) {
        vec3 samplePos = pos + t * rayDir;
        if (any(lessThan(samplePos, volumeBounds[0])) ||
            any(greaterThan(samplePos, volumeBounds[1]))) break;

        vec4 sample = sampleVolume(samplePos);
        float a = sample.a * (1.0 - alpha);
        color.rgb += sample.rgb * a;
        alpha += a;
        if (alpha > 0.95) break;
    }

    gl_FragColor = color;
}`,
  },
  {
    name: 'Toon Shader',
    type: 'fragment',
    description: 'Cel-shaded / toon rendering with quantized lighting bands',
    code: `// Toon / Cel-Shading Shader
uniform vec3 lightDir;
uniform vec3 baseColor;
uniform float edgeThreshold;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(lightDir);
    vec3 V = normalize(cameraPosition - vPosition);

    // Edge detection (fresnel)
    float edge = 1.0 - max(dot(N, V), 0.0);
    if (edge < edgeThreshold) edge = 0.0;
    else edge = 1.0;

    // Quantized diffuse (3 bands)
    float NdotL = max(dot(N, L), 0.0);
    float band;
    if (NdotL > 0.7) band = 1.0;
    else if (NdotL > 0.35) band = 0.6;
    else band = 0.2;

    vec3 color = baseColor * band;
    color = mix(color, vec3(0.0), edge * 0.8);

    gl_FragColor = vec4(color, 1.0);
}`,
  },
  {
    name: 'Wireframe',
    type: 'fragment',
    description: 'Geometry wireframe overlay shader',
    code: `// Wireframe Shader
uniform vec3 wireColor;
uniform float wireWidth;
uniform vec3 fillColor;

varying vec3 vBarycentric;

void main() {
    vec3 d = fwidth(vBarycentric);
    vec3 a = smoothstep(vec3(0.0), d * wireWidth, vBarycentric);
    float wire = min(min(a.x, a.y), a.z);
    gl_FragColor = vec4(mix(wireColor, fillColor, wire), 1.0);
}`,
  },
];
