/** Общие функции шума для шейдеров */
const NOISE = /* glsl */ `
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3. - 2.*f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 5; i++){ v += a*noise(p); p = r*p*2.02; a *= .5; }
  return v;
}`;

/** Фон главной: изолинии медленно текущего скалярного поля, «прогибающиеся» под курсором. */
export const heroShader = /* glsl */ `${NOISE}
void mainImage(out vec4 O, in vec2 F){
  vec2 R = iResolution.xy;
  vec2 uv = F / R.y;
  float t = iTime * .035;
  vec2 q = vec2(fbm(uv*1.3 + t), fbm(uv*1.3 - t + 3.1));
  float f = fbm(uv*1.15 + 1.6*q + vec2(t*.7, -t*.4));

  vec2 m = iMouse.xy / R.y;
  float d = length(uv - m);
  f += .16 * exp(-d*d*14.);

  float v = f * 24.;
  float line  = 1. - smoothstep(0., fwidth(v)*1.1, abs(fract(v - .5) - .5));
  float vm = v / 5.;
  float major = 1. - smoothstep(0., fwidth(vm)*1.6, abs(fract(vm - .5) - .5));

  vec3 col = mix(uAccent, uWarm, smoothstep(.38, .78, f));
  bool wide = R.x > R.y * 1.1;
  float fade = wide ? smoothstep(.12, .78, F.x / R.x) : .55;
  fade *= smoothstep(0., .3, F.y / R.y) * smoothstep(1., .82, F.y / R.y);

  float a = (line*.30 + major*.55 + .10*exp(-d*d*9.)) * fade;
  O = vec4(col * a, a);
}`;

/** Раскраска области комплексной функции w = (z² − 1)(z − c) / (z − m): нули ±1 и c, полюс под курсором. */
export const domainColoringShader = /* glsl */ `
vec2 cmul(vec2 a, vec2 b){ return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x); }
vec2 cdiv(vec2 a, vec2 b){ return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / dot(b, b); }
vec3 hsv(float h, float s, float v){ vec3 k = clamp(abs(mod(h*6. + vec3(0,4,2), 6.) - 3.) - 1., 0., 1.); return v * mix(vec3(1), k, s); }

void mainImage(out vec4 O, in vec2 F){
  vec2 R = iResolution.xy;
  vec2 z = (F - .5*R) / R.y * 4.;
  float t = iTime * .35;
  vec2 c = vec2(cos(t), sin(1.3*t)) * 1.3;
  vec2 m = (iMouse.xy - .5*R) / R.y * 4.;
  vec2 w = cdiv(cmul(cmul(z, z) - vec2(1, 0), z - c), z - m);

  float arg = atan(w.y, w.x) / 6.2831853 + .5;
  float lm = log2(length(w));
  float ring = fract(lm);
  float shade = .62 + .38 * ring;
  float iso = abs(fract(arg * 12.) - .5);
  float phase = smoothstep(0., fwidth(arg*12.) * 1.5, iso);
  vec3 col = hsv(arg, .62, shade) * (.78 + .22 * phase);
  O = vec4(col, 1.);
}`;
