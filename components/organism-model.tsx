"use client";

import { useEffect, useRef } from "react";

interface OrganismModelProps {
  species: string;
  spin?: boolean;
}

interface SphereGeometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
}

function getSpeciesColor(species: string): [number, number, number] {
  const normalized = species.toLowerCase();
  if (normalized.includes("streptococcus")) {
    return [111 / 255, 168 / 255, 220 / 255];
  }
  if (normalized.includes("porphyromonas")) {
    return [192 / 255, 57 / 255, 43 / 255];
  }
  if (normalized.includes("candida")) {
    return [175 / 255, 122 / 255, 197 / 255];
  }
  return [149 / 255, 165 / 255, 166 / 255];
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Unable to create shader");
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const infoLog = gl.getShaderInfoLog(shader);
  if (!compiled) {
    // Log detailed info to help debugging in browser console
    try {
      console.error(`Shader compile failed (type=${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'})`);
      console.error('Info log:', infoLog);
      console.error('Shader source:\n', source);
    } catch (e) {
      // ignore logging errors
    }
    gl.deleteShader(shader);
    throw new Error((infoLog && infoLog.length > 0) ? infoLog : 'Unknown shader compile error');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Unable to create shader program");
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? "Unable to link shader program";
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error(message);
  }
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  return program;
}

function createSphereGeometry(latSegments = 26, lonSegments = 26, radius = 1.1): SphereGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let lat = 0; lat <= latSegments; lat += 1) {
    const theta = (lat * Math.PI) / latSegments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= lonSegments; lon += 1) {
      const phi = (lon * 2 * Math.PI) / lonSegments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;

      normals.push(x, y, z);
      positions.push(radius * x, radius * y, radius * z);
    }
  }

  for (let lat = 0; lat < latSegments; lat += 1) {
    for (let lon = 0; lon < lonSegments; lon += 1) {
      const first = lat * (lonSegments + 1) + lon;
      const second = first + lonSegments + 1;

      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}

function perspectiveMatrix(fov: number, aspect: number, near: number, far: number) {
  const f = 1.0 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);
  return new Float32Array([
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) * rangeInv,
    -1,
    0,
    0,
    2 * far * near * rangeInv,
    0,
  ]);
}

function translationMatrix(z: number) {
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    z,
    1,
  ]);
}

function rotationXMatrix(rad: number) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new Float32Array([
    1,
    0,
    0,
    0,
    0,
    c,
    s,
    0,
    0,
    -s,
    c,
    0,
    0,
    0,
    0,
    1,
  ]);
}

function rotationYMatrix(rad: number) {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return new Float32Array([
    c,
    0,
    -s,
    0,
    0,
    1,
    0,
    0,
    s,
    0,
    c,
    0,
    0,
    0,
    0,
    1,
  ]);
}

function multiplyMatrices(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  const a00 = a[0];
  const a01 = a[1];
  const a02 = a[2];
  const a03 = a[3];
  const a10 = a[4];
  const a11 = a[5];
  const a12 = a[6];
  const a13 = a[7];
  const a20 = a[8];
  const a21 = a[9];
  const a22 = a[10];
  const a23 = a[11];
  const a30 = a[12];
  const a31 = a[13];
  const a32 = a[14];
  const a33 = a[15];

  const b00 = b[0];
  const b01 = b[1];
  const b02 = b[2];
  const b03 = b[3];
  const b10 = b[4];
  const b11 = b[5];
  const b12 = b[6];
  const b13 = b[7];
  const b20 = b[8];
  const b21 = b[9];
  const b22 = b[10];
  const b23 = b[11];
  const b30 = b[12];
  const b31 = b[13];
  const b32 = b[14];
  const b33 = b[15];

  out[0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
  out[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
  out[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
  out[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
  out[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

  return out;
}

function extractNormalMatrix(mat: Float32Array) {
  return new Float32Array([
    mat[0],
    mat[1],
    mat[2],
    mat[4],
    mat[5],
    mat[6],
    mat[8],
    mat[9],
    mat[10],
  ]);
}

import React, { useState } from 'react';

export default function OrganismModel({ species, spin = false }: OrganismModelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const spinRef = useRef(spin);
  const [shaderError, setShaderError] = useState<string | null>(null);

  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl", { antialias: true, premultipliedAlpha: false });
    if (!gl) {
      return;
    }

    const vertexShader = `
      attribute vec3 position;
      attribute vec3 normal;
      uniform mat4 uProjectionMatrix;
      uniform mat4 uModelViewMatrix;
      uniform mat3 uNormalMatrix;
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(uNormalMatrix * normal);
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;
      varying vec3 vNormal;
      uniform vec3 uLightDirection;
      uniform vec3 uBaseColor;
      void main() {
        float lighting = max(dot(normalize(vNormal), normalize(uLightDirection)), 0.0);
        float ambient = 0.35;
        vec3 color = uBaseColor * (ambient + (1.0 - ambient) * lighting);
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    let program: WebGLProgram | null = null;
    try {
      program = createProgram(gl, vertexShader, fragmentShader);
      gl.useProgram(program);
    } catch (e) {
      const msg = String(e);
      console.error('Failed to create or use shader program:', e);
      setShaderError(msg);
      // Graceful fallback: don't attempt to render the 3D model if shaders fail.
      gl.clearColor(0.02, 0.02, 0.02, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return () => { /* nothing to clean up beyond this */ };
    }

    const geometry = createSphereGeometry();

    const positionBuffer = gl.createBuffer();
    const normalBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();

    if (!positionBuffer || !normalBuffer || !indexBuffer) {
      throw new Error("Unable to create buffers");
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    if (positionLocation !== -1) {
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);

    const normalLocation = gl.getAttribLocation(program, "normal");
    if (normalLocation !== -1) {
      gl.enableVertexAttribArray(normalLocation);
      gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

    const projectionLocation = gl.getUniformLocation(program, "uProjectionMatrix");
    const modelViewLocation = gl.getUniformLocation(program, "uModelViewMatrix");
    const normalMatrixLocation = gl.getUniformLocation(program, "uNormalMatrix");
    const lightLocation = gl.getUniformLocation(program, "uLightDirection");
    const colorLocation = gl.getUniformLocation(program, "uBaseColor");

    if (!projectionLocation || !modelViewLocation || !normalMatrixLocation || !lightLocation || !colorLocation) {
      console.error('Missing shader uniforms, aborting WebGL setup');
      return () => { /* cleaned up by outer return */ };
    }

    const baseColor = getSpeciesColor(species);
    gl.uniform3fv(colorLocation, baseColor);
    gl.uniform3fv(lightLocation, new Float32Array([0.5, 0.8, 1]));

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0, 0, 0, 0);

    let projection = perspectiveMatrix((45 * Math.PI) / 180, 1, 0.1, 100);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      projection = perspectiveMatrix((45 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 100);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    let frame = 0;
    let lastTime = performance.now();
    let animationId = 0;

    const render = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      const speed = spinRef.current ? 0.0025 : 0.0009;
      frame += delta * speed;

      const rotationX = rotationXMatrix(frame * 0.7);
      const rotationY = rotationYMatrix(frame);
      const rotationMatrix = multiplyMatrices(rotationY, rotationX);
      const modelViewMatrix = multiplyMatrices(translationMatrix(-4), rotationMatrix);
      const normalMatrix = extractNormalMatrix(rotationMatrix);

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniformMatrix4fv(projectionLocation, false, projection);
      gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
      gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

      gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(normalBuffer);
      gl.deleteBuffer(indexBuffer);
      gl.deleteProgram(program);
    };
  }, [species]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
      {shaderError && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-black bg-opacity-70 text-red-300 rounded p-3 max-w-lg text-center">
            <div className="font-semibold mb-2">3D preview unavailable</div>
            <div className="text-sm break-words">{shaderError}</div>
          </div>
        </div>
      )}
    </div>
  );
}

