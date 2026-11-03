'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AnimationPose, ExerciseCategory } from '@/data/exercises';

interface ExerciseAnimationProps {
  pose: AnimationPose;
  category: ExerciseCategory;
  isActiveTimer?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface Joint2D {
  x: number;
  y: number;
}

interface SkeletonPose {
  head: Joint2D;
  neck: Joint2D;
  shoulder: Joint2D;
  elbow: Joint2D;
  wrist: Joint2D;
  hip: Joint2D;
  knee: Joint2D;
  ankle: Joint2D;
  toe: Joint2D;
  // Secondary limbs (back arm / back leg for depth)
  elbowBack?: Joint2D;
  wristBack?: Joint2D;
  kneeBack?: Joint2D;
  ankleBack?: Joint2D;
  toeBack?: Joint2D;
  // Active muscle highlight zones: 'quads' | 'glutes' | 'core' | 'chest' | 'back' | 'shoulders' | 'arms' | 'calves' | 'hamstrings' | 'hip_flexor'
  activeZones: string[];
  phaseLabel: string;
  breathLabel: string;
}

// Smooth interpolation helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpJoint = (j1: Joint2D, j2: Joint2D, t: number): Joint2D => ({
  x: lerp(j1.x, j2.x, t),
  y: lerp(j1.y, j2.y, t),
});

// Anatomical tapered limb drawer with 3D studio lighting & optional muscle activation glow
function drawAnatomicalLimb(
  ctx: CanvasRenderingContext2D,
  p1: Joint2D,
  p2: Joint2D,
  rStart: number,
  rMid: number,
  rEnd: number,
  baseColor: string,
  highlightColor: string,
  isMuscleActive: boolean,
  muscleGlowColor: string,
  pulseIntensity: number,
  isBackLimb = false
) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;

  const angle = Math.atan2(dy, dx);
  ctx.save();
  ctx.translate(p1.x, p1.y);
  ctx.rotate(angle);

  // Sculpted organic muscle belly contour using cubic bezier curves
  ctx.beginPath();
  ctx.moveTo(0, -rStart);
  ctx.bezierCurveTo(len * 0.3, -rMid * 1.12, len * 0.7, -rMid * 0.95, len, -rEnd);
  ctx.arc(len, 0, rEnd, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(len * 0.7, rMid * 1.05, len * 0.3, rMid * 1.18, 0, rStart);
  ctx.arc(0, 0, rStart, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();

  // 3D cylindrical studio gradient
  const grad = ctx.createLinearGradient(0, -rMid * 1.2, 0, rMid * 1.2);
  if (isBackLimb) {
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0f172a');
  } else {
    grad.addColorStop(0, highlightColor);
    grad.addColorStop(0.45, baseColor);
    grad.addColorStop(1, '#1e293b');
  }
  ctx.fillStyle = grad;
  ctx.fill();

  // Anatomical rim light
  ctx.strokeStyle = isBackLimb ? 'rgba(148,163,184,0.12)' : 'rgba(248,250,252,0.28)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Glowing target muscle belly fiber overlay when active
  if (isMuscleActive) {
    ctx.save();
    const glowAlpha = (isBackLimb ? 0.28 : 0.58) * (0.65 + 0.35 * pulseIntensity);
    const mGrad = ctx.createRadialGradient(
      len * 0.45,
      -rMid * 0.15,
      2,
      len * 0.45,
      0,
      Math.max(len * 0.52, rMid * 1.5)
    );
    mGrad.addColorStop(0, muscleGlowColor);
    mGrad.addColorStop(0.65, `${muscleGlowColor}66`);
    mGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = mGrad;
    ctx.globalAlpha = glowAlpha;
    ctx.fill();

    // Subtle anatomical striated muscle contour lines
    ctx.strokeStyle = muscleGlowColor;
    ctx.globalAlpha = glowAlpha * 0.9;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(len * 0.18, -rMid * 0.35);
    ctx.quadraticCurveTo(len * 0.48, -rMid * 0.72, len * 0.8, -rEnd * 0.4);
    ctx.moveTo(len * 0.18, rMid * 0.35);
    ctx.quadraticCurveTo(len * 0.48, rMid * 0.72, len * 0.8, rEnd * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

// Draw sculpted athletic torso with ribcage, pectorals, latissimus & core definition
function drawAnatomicalTorso(
  ctx: CanvasRenderingContext2D,
  hip: Joint2D,
  shoulder: Joint2D,
  activeZones: string[],
  glowColor: string,
  pulse: number
) {
  const dx = shoulder.x - hip.x;
  const dy = shoulder.y - hip.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.translate(hip.x, hip.y);
  ctx.rotate(angle);

  const wHip = 13;
  const wWaist = 11.5;
  const wChest = 16.5;

  // Torso silhouette
  ctx.beginPath();
  ctx.moveTo(0, -wHip);
  ctx.bezierCurveTo(len * 0.35, -wWaist, len * 0.65, -wChest * 1.08, len, -wChest * 0.92);
  ctx.arc(len, 0, wChest * 0.92, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(len * 0.65, wChest * 1.02, len * 0.35, wWaist, 0, wHip);
  ctx.arc(0, 0, wHip, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();

  // Compression athletic shirt shading
  const tGrad = ctx.createLinearGradient(0, -wChest, 0, wChest);
  tGrad.addColorStop(0, '#475569');
  tGrad.addColorStop(0.45, '#334155');
  tGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = tGrad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(226,232,240,0.32)';
  ctx.lineWidth = 1.3;
  ctx.stroke();

  // Highlight Core (Abdominals / Obliques / Lower Back)
  if (activeZones.includes('core')) {
    ctx.save();
    ctx.globalAlpha = 0.65 * (0.7 + 0.3 * pulse);
    const coreGrad = ctx.createRadialGradient(len * 0.38, 0, 2, len * 0.38, 0, len * 0.45);
    coreGrad.addColorStop(0, glowColor);
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.fill();
    ctx.restore();
  }

  // Highlight Chest / Pectorals
  if (activeZones.includes('chest')) {
    ctx.save();
    ctx.globalAlpha = 0.7 * (0.7 + 0.3 * pulse);
    const chestGrad = ctx.createRadialGradient(
      len * 0.76,
      -wChest * 0.35,
      2,
      len * 0.76,
      -wChest * 0.35,
      wChest * 1.1
    );
    chestGrad.addColorStop(0, glowColor);
    chestGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = chestGrad;
    ctx.fill();
    ctx.restore();
  }

  // Highlight Back / Latissimus / Spine
  if (activeZones.includes('back')) {
    ctx.save();
    ctx.globalAlpha = 0.7 * (0.7 + 0.3 * pulse);
    const backGrad = ctx.createRadialGradient(
      len * 0.62,
      wChest * 0.35,
      2,
      len * 0.62,
      wChest * 0.35,
      len * 0.48
    );
    backGrad.addColorStop(0, glowColor);
    backGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = backGrad;
    ctx.fill();
    ctx.restore();
  }

  // Glutes highlight at hip joint
  if (activeZones.includes('glutes')) {
    ctx.save();
    ctx.globalAlpha = 0.72 * (0.7 + 0.3 * pulse);
    ctx.fillStyle = glowColor;
    ctx.beginPath();
    ctx.arc(2, wHip * 0.25, wHip * 0.95, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// Draw sculpted head, neck, and athletic shoe
function drawHeadAndShoe(
  ctx: CanvasRenderingContext2D,
  neck: Joint2D,
  head: Joint2D,
  ankle: Joint2D,
  toe: Joint2D,
  ankleBack?: Joint2D,
  toeBack?: Joint2D
) {
  // Neck
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(neck.x, neck.y);
  ctx.lineTo(head.x, head.y);
  ctx.stroke();

  // Sculpted Head with studio lighting
  ctx.save();
  const hGrad = ctx.createRadialGradient(head.x - 4, head.y - 4, 2, head.x, head.y, 14);
  hGrad.addColorStop(0, '#f8fafc');
  hGrad.addColorStop(0.65, '#cbd5e1');
  hGrad.addColorStop(1, '#475569');
  ctx.fillStyle = hGrad;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 12.5, 0, Math.PI * 2);
  ctx.fill();

  // Subtle headband / athletic detail
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(head.x, head.y, 12.2, -Math.PI * 0.75, -Math.PI * 0.15);
  ctx.stroke();
  ctx.restore();

  // Draw shoes
  const drawShoe = (a: Joint2D, t: Joint2D, isBack: boolean) => {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.x - 4, a.y + 5);
    ctx.lineTo(t.x + 4, t.y + 5);
    ctx.quadraticCurveTo(t.x + 6, t.y - 3, t.x - 2, t.y - 4);
    ctx.lineTo(a.x - 2, a.y - 3);
    ctx.closePath();
    ctx.fillStyle = isBack ? '#334155' : '#e2e8f0';
    ctx.fill();
    // Shoe sole
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(a.x - 4, a.y + 5);
    ctx.lineTo(t.x + 4, t.y + 5);
    ctx.stroke();
    ctx.restore();
  };

  if (ankleBack && toeBack) drawShoe(ankleBack, toeBack, true);
  drawShoe(ankle, toe, false);
}

// Compute the exact biomechanical skeleton pose for any exercise at normalized cycle `t` (0..1)
function computeBiomechanicalPose(pose: AnimationPose, t: number): SkeletonPose {
  // Smooth back-and-forth cycle (0 -> 1 -> 0) with brief pause at peak contraction
  const rawWave = (1 - Math.cos(t * Math.PI * 2)) / 2;
  // Cubic smoothstep for realistic muscular acceleration/deceleration
  const phase = rawWave * rawWave * (3 - 2 * rawWave);
  const microBreath = Math.sin(t * Math.PI * 2) * 2.2;

  const isConcentric = t < 0.5;
  const breathText = isConcentric ? 'Gleichmäßig ausatmen' : 'Tief durch die Nase einatmen';

  switch (pose) {
    case 'wall_sit': {
      return {
        head: { x: 108, y: 54 + microBreath * 0.4 },
        neck: { x: 106, y: 68 },
        shoulder: { x: 104, y: 78 + microBreath * 0.4 },
        elbow: { x: 128, y: 104 },
        wrist: { x: 154, y: 102 },
        hip: { x: 104, y: 132 },
        knee: { x: 162, y: 132 },
        ankle: { x: 162, y: 188 },
        toe: { x: 182, y: 188 },
        kneeBack: { x: 156, y: 130 },
        ankleBack: { x: 156, y: 186 },
        toeBack: { x: 176, y: 186 },
        activeZones: ['quads', 'glutes', 'core'],
        phaseLabel: 'Isometrisch 90° halten (Keine Pressatmung!)',
        breathLabel: '4 Sek. Einatmen · 4 Sek. Ausatmen',
      };
    }

    case 'iso_squat_hold': {
      return {
        head: { x: 174, y: 64 + microBreath * 0.6 },
        neck: { x: 166, y: 78 },
        shoulder: { x: 160, y: 88 + microBreath * 0.5 },
        elbow: { x: 196, y: 92 },
        wrist: { x: 228, y: 88 },
        hip: { x: 124, y: 132 + microBreath * 0.5 },
        knee: { x: 178, y: 134 },
        ankle: { x: 164, y: 188 },
        toe: { x: 186, y: 188 },
        kneeBack: { x: 172, y: 132 },
        ankleBack: { x: 158, y: 186 },
        toeBack: { x: 180, y: 186 },
        activeZones: ['quads', 'glutes', 'core'],
        phaseLabel: 'Freie 90°-Hocke statisch stabilisieren',
        breathLabel: 'Ruhig in den Bauch atmen',
      };
    }

    case 'handgrip_iso': {
      return {
        head: { x: 148, y: 44 + microBreath * 0.4 },
        neck: { x: 146, y: 60 },
        shoulder: { x: 144, y: 72 },
        elbow: { x: 148, y: 112 },
        wrist: { x: 188, y: 104 },
        hip: { x: 142, y: 128 },
        knee: { x: 146, y: 158 },
        ankle: { x: 144, y: 188 },
        toe: { x: 164, y: 188 },
        activeZones: ['arms', 'shoulders'],
        phaseLabel: 'Konstant 30–40 % Griffkraft halten',
        breathLabel: 'Schultern locker · Ruhig weiteratmen',
      };
    }

    case 'plank': {
      return {
        head: { x: 242, y: 112 + microBreath * 0.5 },
        neck: { x: 226, y: 116 },
        shoulder: { x: 214, y: 120 + microBreath * 0.5 },
        elbow: { x: 212, y: 184 },
        wrist: { x: 244, y: 186 },
        hip: { x: 144, y: 142 + microBreath * 0.6 },
        knee: { x: 102, y: 162 },
        ankle: { x: 64, y: 178 },
        toe: { x: 60, y: 190 },
        activeZones: ['core', 'shoulders', 'glutes'],
        phaseLabel: 'Körperlinie brettfest halten (Kein Hohlkreuz)',
        breathLabel: 'Fließende Flankenatmung',
      };
    }

    case 'side_plank': {
      return {
        head: { x: 232, y: 96 + microBreath * 0.5 },
        neck: { x: 216, y: 104 },
        shoulder: { x: 204, y: 110 },
        elbow: { x: 204, y: 184 },
        wrist: { x: 228, y: 186 },
        elbowBack: { x: 202, y: 74 },
        wristBack: { x: 202, y: 44 },
        hip: { x: 142, y: 142 + microBreath * 0.6 },
        knee: { x: 102, y: 164 },
        ankle: { x: 64, y: 184 },
        toe: { x: 60, y: 190 },
        activeZones: ['core', 'glutes', 'shoulders'],
        phaseLabel: 'Becken hochdrücken · Seitliche Kette aktiv',
        breathLabel: 'Ruhig ein- und ausatmen',
      };
    }

    case 'glute_bridge_hold': {
      return {
        head: { x: 78, y: 180 },
        neck: { x: 94, y: 180 },
        shoulder: { x: 108, y: 178 },
        elbow: { x: 136, y: 184 },
        wrist: { x: 166, y: 186 },
        hip: { x: 166, y: 130 + microBreath * 0.7 },
        knee: { x: 216, y: 112 },
        ankle: { x: 222, y: 186 },
        toe: { x: 242, y: 188 },
        kneeBack: { x: 212, y: 110 },
        ankleBack: { x: 216, y: 184 },
        toeBack: { x: 236, y: 186 },
        activeZones: ['glutes', 'hamstrings', 'core'],
        phaseLabel: 'Becken in einer Diagonale halten · Gesäß fest',
        breathLabel: 'Tiefe Bauchatmung',
      };
    }

    case 'hollow_hold': {
      return {
        head: { x: 96, y: 142 + microBreath * 0.5 },
        neck: { x: 108, y: 152 },
        shoulder: { x: 120, y: 160 },
        elbow: { x: 92, y: 132 },
        wrist: { x: 68, y: 112 },
        hip: { x: 168, y: 182 },
        knee: { x: 214, y: 158 },
        ankle: { x: 254, y: 134 + microBreath * 0.6 },
        toe: { x: 270, y: 128 },
        activeZones: ['core'],
        phaseLabel: 'Lendenwirbelsäule fest in die Matte pressen!',
        breathLabel: 'Kontrollierte Brustkorb-Atmung',
      };
    }

    case 'l_sit': {
      return {
        head: { x: 134, y: 66 + microBreath * 0.4 },
        neck: { x: 134, y: 82 },
        shoulder: { x: 134, y: 94 },
        elbow: { x: 134, y: 132 },
        wrist: { x: 134, y: 168 },
        hip: { x: 134, y: 148 + microBreath * 0.5 },
        knee: { x: 182, y: 146 },
        ankle: { x: 228, y: 144 },
        toe: { x: 242, y: 134 },
        activeZones: ['core', 'arms', 'shoulders', 'quads'],
        phaseLabel: 'Schultern aktiv nach unten drücken · Beine 90°',
        breathLabel: 'Fließend weiteratmen',
      };
    }

    case 'superman_hold': {
      return {
        head: { x: 236, y: 142 + microBreath * 0.6 },
        neck: { x: 218, y: 152 },
        shoulder: { x: 204, y: 158 },
        elbow: { x: 234, y: 146 },
        wrist: { x: 266, y: 134 },
        hip: { x: 146, y: 180 },
        knee: { x: 102, y: 164 },
        ankle: { x: 62, y: 144 + microBreath * 0.6 },
        toe: { x: 46, y: 138 },
        activeZones: ['back', 'glutes', 'shoulders'],
        phaseLabel: 'Rückenstrecker & Gesäß statisch anspannen',
        breathLabel: 'Ruhig in den Bauch atmen',
      };
    }

    case 'calf_hold': {
      return {
        head: { x: 168, y: 36 + microBreath * 0.4 },
        neck: { x: 168, y: 52 },
        shoulder: { x: 168, y: 64 },
        elbow: { x: 156, y: 98 },
        wrist: { x: 172, y: 114 },
        hip: { x: 168, y: 118 },
        knee: { x: 170, y: 152 },
        ankle: { x: 172, y: 176 },
        toe: { x: 192, y: 190 },
        activeZones: ['calves'],
        phaseLabel: 'Maximale Fersenhöhe statisch einfrieren',
        breathLabel: '4 Sek. Ein · 4 Sek. Aus',
      };
    }

    case 'dead_hang': {
      return {
        head: { x: 170, y: 66 + microBreath * 0.5 },
        neck: { x: 170, y: 80 },
        shoulder: { x: 170, y: 90 + microBreath * 0.5 },
        elbow: { x: 158, y: 58 },
        wrist: { x: 154, y: 28 },
        elbowBack: { x: 182, y: 58 },
        wristBack: { x: 186, y: 28 },
        hip: { x: 170, y: 138 + microBreath * 0.5 },
        knee: { x: 168, y: 166 },
        ankle: { x: 164, y: 184 },
        toe: { x: 176, y: 188 },
        activeZones: ['arms', 'back', 'shoulders'],
        phaseLabel: 'Aktiver Schulterzug · Wirbelsäule lang werden lassen',
        breathLabel: 'Tief in die Rippenbögen atmen',
      };
    }

    case 'pullup': {
      const pullY = lerp(0, -40, phase);
      return {
        head: { x: 170, y: 74 + pullY },
        neck: { x: 170, y: 88 + pullY },
        shoulder: { x: 170, y: 98 + pullY },
        elbow: { x: lerp(158, 142, phase), y: lerp(62, 74, phase) },
        wrist: { x: 154, y: 28 },
        elbowBack: { x: lerp(182, 198, phase), y: lerp(62, 74, phase) },
        wristBack: { x: 186, y: 28 },
        hip: { x: 170, y: 146 + pullY },
        knee: { x: 168, y: 172 + pullY },
        ankle: { x: 160, y: 186 + pullY * 0.7 },
        toe: { x: 174, y: 190 + pullY * 0.7 },
        activeZones: ['back', 'arms', 'core'],
        phaseLabel:
          phase > 0.5
            ? 'Konzentrisch: Brust stolz zur Stange ziehen'
            : 'Exzentrisch: Kontrolliert in den Hang ablassen',
        breathLabel: breathText,
      };
    }

    case 'bench_press': {
      const barY = lerp(58, 102, phase);
      const elbowY = lerp(94, 134, phase);
      return {
        head: { x: 92, y: 122 },
        neck: { x: 108, y: 124 },
        shoulder: { x: 126, y: 124 },
        elbow: { x: 138, y: elbowY },
        wrist: { x: 134, y: barY },
        hip: { x: 186, y: 126 },
        knee: { x: 226, y: 132 },
        ankle: { x: 232, y: 186 },
        toe: { x: 252, y: 188 },
        activeZones: ['chest', 'shoulders', 'arms'],
        phaseLabel:
          phase > 0.5
            ? 'Unten kurz stabilisieren & explosiv hochdrücken'
            : 'Langsam & kontrolliert zur Brust absenken',
        breathLabel: breathText,
      };
    }

    case 'barbell_squat': {
      const start = {
        head: { x: 168, y: 42 },
        neck: { x: 166, y: 56 },
        shoulder: { x: 164, y: 66 },
        elbow: { x: 148, y: 84 },
        wrist: { x: 158, y: 66 },
        hip: { x: 158, y: 118 },
        knee: { x: 168, y: 154 },
        ankle: { x: 164, y: 188 },
        toe: { x: 186, y: 188 },
      };
      const bottom = {
        head: { x: 172, y: 78 },
        neck: { x: 166, y: 92 },
        shoulder: { x: 160, y: 102 },
        elbow: { x: 142, y: 118 },
        wrist: { x: 154, y: 102 },
        hip: { x: 120, y: 144 },
        knee: { x: 182, y: 146 },
        ankle: { x: 164, y: 188 },
        toe: { x: 186, y: 188 },
      };
      return {
        head: lerpJoint(start.head, bottom.head, phase),
        neck: lerpJoint(start.neck, bottom.neck, phase),
        shoulder: lerpJoint(start.shoulder, bottom.shoulder, phase),
        elbow: lerpJoint(start.elbow, bottom.elbow, phase),
        wrist: lerpJoint(start.wrist, bottom.wrist, phase),
        hip: lerpJoint(start.hip, bottom.hip, phase),
        knee: lerpJoint(start.knee, bottom.knee, phase),
        ankle: start.ankle,
        toe: start.toe,
        kneeBack: lerpJoint({ x: 162, y: 152 }, { x: 176, y: 144 }, phase),
        ankleBack: { x: 158, y: 186 },
        toeBack: { x: 180, y: 186 },
        activeZones: ['quads', 'glutes', 'core'],
        phaseLabel:
          phase > 0.5
            ? 'Tiefe Position: Knie stabil, aus den Fersen drücken'
            : 'Hüfte kontrolliert nach hinten-unten einleiten',
        breathLabel: breathText,
      };
    }

    case 'leg_press': {
      const sledPush = lerp(0, 1, phase);
      return {
        head: { x: 86, y: 116 },
        neck: { x: 96, y: 128 },
        shoulder: { x: 104, y: 138 },
        elbow: { x: 118, y: 158 },
        wrist: { x: 138, y: 164 },
        hip: { x: 132, y: 166 },
        knee: {
          x: lerp(148, 178, sledPush),
          y: lerp(114, 134, sledPush),
        },
        ankle: {
          x: lerp(192, 228, sledPush),
          y: lerp(96, 74, sledPush),
        },
        toe: {
          x: lerp(202, 238, sledPush),
          y: lerp(78, 56, sledPush),
        },
        activeZones: ['quads', 'glutes'],
        phaseLabel:
          sledPush > 0.5
            ? 'Beine kraftvoll strecken (Knie nicht durchschlagen!)'
            : 'Gewicht kontrolliert bis 90° Kniewinkel absenken',
        breathLabel: breathText,
      };
    }

    case 'deadlift': {
      const start = {
        head: { x: 170, y: 42 },
        neck: { x: 166, y: 56 },
        shoulder: { x: 164, y: 68 },
        elbow: { x: 164, y: 98 },
        wrist: { x: 166, y: 126 },
        hip: { x: 156, y: 118 },
        knee: { x: 166, y: 154 },
      };
      const hinge = {
        head: { x: 204, y: 78 },
        neck: { x: 192, y: 86 },
        shoulder: { x: 182, y: 92 },
        elbow: { x: 180, y: 124 },
        wrist: { x: 178, y: 154 },
        hip: { x: 124, y: 116 },
        knee: { x: 158, y: 154 },
      };
      return {
        head: lerpJoint(start.head, hinge.head, phase),
        neck: lerpJoint(start.neck, hinge.neck, phase),
        shoulder: lerpJoint(start.shoulder, hinge.shoulder, phase),
        elbow: lerpJoint(start.elbow, hinge.elbow, phase),
        wrist: lerpJoint(start.wrist, hinge.wrist, phase),
        hip: lerpJoint(start.hip, hinge.hip, phase),
        knee: lerpJoint(start.knee, hinge.knee, phase),
        ankle: { x: 162, y: 188 },
        toe: { x: 184, y: 188 },
        activeZones: ['hamstrings', 'glutes', 'back'],
        phaseLabel:
          phase > 0.5
            ? 'Dehnung der Beinrückseite spüren · Rücken gerade!'
            : 'Hüfte kraftvoll nach vorn strecken (Hip Hinge)',
        breathLabel: breathText,
      };
    }

    case 'seated_row': {
      const pull = phase;
      return {
        head: { x: lerp(138, 126, pull), y: 72 },
        neck: { x: lerp(136, 126, pull), y: 86 },
        shoulder: { x: lerp(136, 124, pull), y: 98 },
        elbow: { x: lerp(168, 108, pull), y: lerp(108, 122, pull) },
        wrist: { x: lerp(204, 144, pull), y: 116 },
        hip: { x: 128, y: 152 },
        knee: { x: 176, y: 146 },
        ankle: { x: 222, y: 176 },
        toe: { x: 234, y: 162 },
        activeZones: ['back', 'arms', 'shoulders'],
        phaseLabel:
          pull > 0.5
            ? 'Schulterblätter hinten maximal zusammenziehen'
            : 'Kontrolliert nach vorn lassen, Brust bleibt stolz',
        breathLabel: breathText,
      };
    }

    case 'bicep_curl': {
      const curlAngle = lerp(0.25, -1.65, phase);
      const elbow = { x: 166, y: 106 };
      const wrist = {
        x: elbow.x + Math.cos(curlAngle) * 32,
        y: elbow.y - Math.sin(curlAngle) * 32,
      };
      return {
        head: { x: 162, y: 42 },
        neck: { x: 162, y: 56 },
        shoulder: { x: 162, y: 68 },
        elbow,
        wrist,
        hip: { x: 160, y: 122 },
        knee: { x: 164, y: 156 },
        ankle: { x: 162, y: 188 },
        toe: { x: 184, y: 188 },
        activeZones: ['arms'],
        phaseLabel:
          phase > 0.5
            ? 'Spitzenkontraktion im Bizeps · Ellbogen bleibt fixiert'
            : 'Ohne Schwung kontrolliert absenken',
        breathLabel: breathText,
      };
    }

    case 'lat_pulldown': {
      const barY = lerp(42, 92, phase);
      return {
        head: { x: 146, y: 74 },
        neck: { x: 146, y: 88 },
        shoulder: { x: 146, y: 100 },
        elbow: { x: lerp(164, 142, phase), y: lerp(68, 122, phase) },
        wrist: { x: 168, y: barY },
        hip: { x: 144, y: 152 },
        knee: { x: 188, y: 152 },
        ankle: { x: 188, y: 188 },
        toe: { x: 208, y: 188 },
        activeZones: ['back', 'arms'],
        phaseLabel:
          phase > 0.5
            ? 'Stange bis zum oberen Brustbein ziehen'
            : 'Schultergürtel kontrolliert nach oben dehnen lassen',
        breathLabel: breathText,
      };
    }

    case 'shoulder_press': {
      const pressY = lerp(88, 34, phase);
      return {
        head: { x: 162, y: 58 },
        neck: { x: 162, y: 72 },
        shoulder: { x: 162, y: 84 },
        elbow: { x: lerp(144, 154, phase), y: lerp(108, 62, phase) },
        wrist: { x: 156, y: pressY },
        hip: { x: 162, y: 134 },
        knee: { x: 164, y: 162 },
        ankle: { x: 162, y: 188 },
        toe: { x: 184, y: 188 },
        activeZones: ['shoulders', 'arms', 'core'],
        phaseLabel:
          phase > 0.5
            ? 'Überkopf strecken ohne Hohlkreuz'
            : 'Kontrolliert auf Kinnhöhe absenken',
        breathLabel: breathText,
      };
    }

    case 'pushup': {
      const drop = phase;
      return {
        head: { x: 244, y: lerp(96, 134, drop) },
        neck: { x: 228, y: lerp(102, 138, drop) },
        shoulder: { x: 214, y: lerp(108, 144, drop) },
        elbow: { x: lerp(212, 192, drop), y: lerp(148, 136, drop) },
        wrist: { x: 214, y: 186 },
        hip: { x: 146, y: lerp(136, 158, drop) },
        knee: { x: 104, y: lerp(156, 170, drop) },
        ankle: { x: 64, y: 176 },
        toe: { x: 60, y: 190 },
        activeZones: ['chest', 'arms', 'core', 'shoulders'],
        phaseLabel:
          drop > 0.5
            ? 'Brust knapp über dem Boden · Rumpf brettfest'
            : 'Volle Streckung aus Brust und Trizeps',
        breathLabel: breathText,
      };
    }

    case 'mountain_climber': {
      const drive = phase;
      return {
        head: { x: 244, y: 96 },
        neck: { x: 228, y: 102 },
        shoulder: { x: 214, y: 108 },
        elbow: { x: 214, y: 148 },
        wrist: { x: 216, y: 186 },
        hip: { x: 148, y: 132 },
        knee: {
          x: lerp(106, 184, drive),
          y: lerp(158, 138, drive),
        },
        ankle: {
          x: lerp(66, 146, drive),
          y: lerp(176, 166, drive),
        },
        toe: {
          x: lerp(62, 142, drive),
          y: lerp(190, 178, drive),
        },
        kneeBack: {
          x: lerp(184, 106, drive),
          y: lerp(138, 158, drive),
        },
        ankleBack: {
          x: lerp(146, 66, drive),
          y: lerp(166, 176, drive),
        },
        toeBack: {
          x: lerp(142, 62, drive),
          y: lerp(178, 190, drive),
        },
        activeZones: ['core', 'hip_flexor', 'shoulders'],
        phaseLabel: 'Knie dynamisch unter die Brust ziehen · Hüfte ruhig halten',
        breathLabel: 'Rhythmisch durchatmen',
      };
    }

    case 'lunge': {
      const depth = phase;
      return {
        head: { x: 166, y: lerp(42, 72, depth) },
        neck: { x: 166, y: lerp(56, 86, depth) },
        shoulder: { x: 166, y: lerp(68, 98, depth) },
        elbow: { x: 158, y: lerp(98, 124, depth) },
        wrist: { x: 174, y: lerp(108, 134, depth) },
        hip: { x: 164, y: lerp(118, 144, depth) },
        // Front leg
        knee: { x: 214, y: lerp(148, 144, depth) },
        ankle: { x: 214, y: 188 },
        toe: { x: 236, y: 188 },
        // Back leg
        kneeBack: { x: 126, y: lerp(152, 178, depth) },
        ankleBack: { x: 86, y: 180 },
        toeBack: { x: 82, y: 190 },
        activeZones: ['quads', 'glutes', 'core'],
        phaseLabel:
          depth > 0.5
            ? '90° in beiden Knien · Vorderes Knie stabil über dem Fuß'
            : 'Kraftvoll über die vordere Ferse hochdrücken',
        breathLabel: breathText,
      };
    }

    case 'dips': {
      const dip = phase;
      return {
        head: { x: 154, y: lerp(58, 86, dip) },
        neck: { x: 154, y: lerp(72, 100, dip) },
        shoulder: { x: 154, y: lerp(84, 112, dip) },
        elbow: { x: lerp(132, 116, dip), y: lerp(104, 102, dip) },
        wrist: { x: 128, y: 130 },
        hip: { x: 156, y: lerp(134, 162, dip) },
        knee: { x: 196, y: lerp(148, 166, dip) },
        ankle: { x: 234, y: 186 },
        toe: { x: 252, y: 186 },
        activeZones: ['arms', 'chest', 'shoulders'],
        phaseLabel:
          dip > 0.5
            ? 'Oberarme parallel zum Boden · Schultern tief halten'
            : 'Trizeps kraftvoll strecken',
        breathLabel: breathText,
      };
    }

    case 'hip_flexor_stretch': {
      const lean = phase * 8;
      return {
        head: { x: 170 + lean, y: 54 },
        neck: { x: 168 + lean, y: 68 },
        shoulder: { x: 166 + lean, y: 80 },
        elbow: { x: 178 + lean, y: 108 },
        wrist: { x: 204 + lean, y: 122 },
        hip: { x: 162 + lean, y: 132 },
        knee: { x: 214, y: 134 },
        ankle: { x: 214, y: 188 },
        toe: { x: 236, y: 188 },
        kneeBack: { x: 122, y: 186 },
        ankleBack: { x: 78, y: 188 },
        toeBack: { x: 66, y: 190 },
        activeZones: ['hip_flexor', 'glutes'],
        phaseLabel: 'Becken aufrichten & Leiste sanft nach vorn schieben',
        breathLabel: '4 Sek. Ein · 6 Sek. Langsam Ausatmen',
      };
    }

    case 'pigeon_stretch': {
      return {
        head: { x: 212, y: 108 + microBreath * 1.2 },
        neck: { x: 198, y: 118 + microBreath },
        shoulder: { x: 186, y: 126 + microBreath },
        elbow: { x: 202, y: 164 },
        wrist: { x: 228, y: 186 },
        hip: { x: 146, y: 168 },
        knee: { x: 194, y: 178 },
        ankle: { x: 172, y: 186 },
        toe: { x: 184, y: 188 },
        kneeBack: { x: 102, y: 182 },
        ankleBack: { x: 58, y: 186 },
        toeBack: { x: 44, y: 188 },
        activeZones: ['glutes', 'hip_flexor'],
        phaseLabel: 'Tiefe Gesäß- & Piriformis-Dehnung ruhig zulassen',
        breathLabel: 'Mit jedem Ausatmen Hüfte schwer sinken lassen',
      };
    }

    case 'childs_pose': {
      return {
        head: { x: 206, y: 172 + microBreath * 0.8 },
        neck: { x: 192, y: 168 },
        shoulder: { x: 178, y: 162 + microBreath * 1.2 },
        elbow: { x: 214, y: 182 },
        wrist: { x: 248, y: 186 },
        hip: { x: 116, y: 166 },
        knee: { x: 162, y: 186 },
        ankle: { x: 108, y: 186 },
        toe: { x: 94, y: 188 },
        activeZones: ['back', 'shoulders'],
        phaseLabel: 'Unterer Rücken & Latissimus entspannen komplett',
        breathLabel: 'Tiefe Rücken-Atmung (Parasympathikus)',
      };
    }

    case 'hamstring_stretch': {
      const reach = phase * 10;
      return {
        head: { x: 192 + reach * 0.6, y: 74 + reach * 0.5 },
        neck: { x: 180 + reach * 0.5, y: 84 + reach * 0.4 },
        shoulder: { x: 170 + reach * 0.4, y: 94 + reach * 0.3 },
        elbow: { x: 184 + reach * 0.7, y: 126 + reach * 0.4 },
        wrist: { x: 206 + reach, y: 152 + reach * 0.4 },
        hip: { x: 132, y: 126 },
        knee: { x: 176, y: 158 },
        ankle: { x: 218, y: 186 },
        toe: { x: 230, y: 172 },
        kneeBack: { x: 134, y: 158 },
        ankleBack: { x: 134, y: 188 },
        toeBack: { x: 152, y: 188 },
        activeZones: ['hamstrings', 'calves'],
        phaseLabel: 'Mit geradem Rücken aus dem Hüftgelenk vorbeugen',
        breathLabel: 'Ruhig ausatmen & Spannung loslassen',
      };
    }

    case 'cat_cow': {
      const arch = lerp(-14, 14, phase);
      return {
        head: { x: 224, y: 126 - arch * 0.7 },
        neck: { x: 208, y: 124 - arch * 0.5 },
        shoulder: { x: 194, y: 124 + arch * 0.4 },
        elbow: { x: 194, y: 156 },
        wrist: { x: 196, y: 186 },
        hip: { x: 126, y: 124 + arch * 0.4 },
        knee: { x: 126, y: 186 },
        ankle: { x: 86, y: 186 },
        toe: { x: 74, y: 188 },
        activeZones: ['back', 'core'],
        phaseLabel:
          phase > 0.5
            ? 'Katzenbuckel: Wirbelsäule rund zur Decke wölben'
            : 'Brustbein sanft heben & Schulterblätter führen',
        breathLabel: breathText,
      };
    }

    case 'chest_opener':
    default: {
      return {
        head: { x: 166, y: 44 + microBreath * 0.5 },
        neck: { x: 166, y: 58 },
        shoulder: { x: 166, y: 70 },
        elbow: { x: 132, y: 78 },
        wrist: { x: 128, y: 48 },
        hip: { x: 166, y: 124 },
        knee: { x: 168, y: 156 },
        ankle: { x: 166, y: 188 },
        toe: { x: 186, y: 188 },
        activeZones: ['chest', 'shoulders'],
        phaseLabel: 'Brustkorb weit öffnen & Schulterblätter senken',
        breathLabel: 'Tief in den Brustkorb einatmen',
      };
    }
  }
}

// Draw realistic studio gym equipment behind/around the athlete
function drawStudioEquipment(
  ctx: CanvasRenderingContext2D,
  pose: AnimationPose,
  skel: SkeletonPose
) {
  ctx.save();

  if (pose === 'wall_sit' || pose === 'chest_opener') {
    // Architectural textured studio wall
    const wallGrad = ctx.createLinearGradient(74, 20, 96, 20);
    wallGrad.addColorStop(0, '#0f172a');
    wallGrad.addColorStop(1, '#334155');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(74, 22, 18, 168);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(92, 22);
    ctx.lineTo(92, 190);
    ctx.stroke();

    if (pose === 'wall_sit') {
      // 90° biomechanical knee angle arc
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(skel.knee.x - 16, skel.knee.y, 16, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('90°', skel.knee.x + 12, skel.knee.y - 8);
    }
  }

  if (pose === 'bench_press') {
    // Heavy-duty gym bench
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(78, 134, 122, 12, 5);
    ctx.fill();
    ctx.stroke();
    // Steel bench legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(96, 146, 8, 44);
    ctx.fillRect(178, 146, 8, 44);
  }

  if (pose === 'leg_press') {
    // 45-degree leg press seat & sled rails
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(74, 122);
    ctx.lineTo(124, 176);
    ctx.lineTo(156, 176);
    ctx.stroke();

    // Footplate sled
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(skel.ankle.x + 8, skel.ankle.y + 16);
    ctx.lineTo(skel.toe.x + 14, skel.toe.y - 16);
    ctx.stroke();
  }

  if (pose === 'dead_hang' || pose === 'pullup') {
    // Pull-up rig frame & knurled bar
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(92, 190);
    ctx.lineTo(92, 26);
    ctx.lineTo(248, 26);
    ctx.lineTo(248, 190);
    ctx.stroke();

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(116, 26);
    ctx.lineTo(224, 26);
    ctx.stroke();
  }

  if (pose === 'lat_pulldown') {
    // Cable tower & seat
    ctx.fillStyle = '#334155';
    ctx.fillRect(122, 158, 46, 10);
    ctx.fillRect(140, 168, 10, 22);
    // Cable line from top pulley to wrists
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(168, 16);
    ctx.lineTo(skel.wrist.x, skel.wrist.y);
    ctx.stroke();
    ctx.setLineDash([]);
    // Pulldown bar
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(skel.wrist.x - 24, skel.wrist.y);
    ctx.lineTo(skel.wrist.x + 24, skel.wrist.y);
    ctx.stroke();
  }

  if (pose === 'seated_row') {
    // Horizontal cable & foot platform
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(260, 116);
    ctx.lineTo(skel.wrist.x, skel.wrist.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (pose === 'dips') {
    // Dip box / bench behind athlete
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(82, 130, 54, 60, 6);
    ctx.fill();
    ctx.stroke();
  }

  if (pose === 'l_sit') {
    // Parallettes bars
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(116, 190);
    ctx.lineTo(116, 168);
    ctx.lineTo(152, 168);
    ctx.lineTo(152, 190);
    ctx.stroke();
  }

  ctx.restore();
}

// Draw foreground weights (Barbells, Bumper Plates, Dumbbells) in the athlete's hands
function drawForegroundWeights(
  ctx: CanvasRenderingContext2D,
  pose: AnimationPose,
  skel: SkeletonPose,
  accent: string
) {
  ctx.save();
  if (
    pose === 'bench_press' ||
    pose === 'barbell_squat' ||
    pose === 'deadlift' ||
    pose === 'shoulder_press' ||
    pose === 'bicep_curl'
  ) {
    const w = skel.wrist;
    // Olympic Bumper Plate / Dumbbell side view
    const radius = pose === 'deadlift' ? 20 : pose === 'bicep_curl' ? 10 : 15;
    ctx.beginPath();
    ctx.arc(w.x, w.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = accent;
    ctx.stroke();

    // Inner steel hub
    ctx.beginPath();
    ctx.arc(w.x, w.y, radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
  }
  ctx.restore();
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  pose,
  category,
  isActiveTimer = false,
  size = 'md',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showMuscleXray, setShowMuscleXray] = useState<boolean>(true);
  const [livePhaseText, setLivePhaseText] = useState<string>('');

  const heightClass =
    size === 'sm' ? 'h-44' : size === 'lg' ? 'h-72' : 'h-56';

  const accentColor =
    category === 'isometrisch'
      ? '#a78bfa'
      : category === 'geraete'
      ? '#10b981'
      : category === 'koerpergewicht'
      ? '#06b6d4'
      : '#f59e0b';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const renderFrame = (now: number) => {
      const dpr = window.devicePixelRatio || 1;
      const logicalW = 340;
      const logicalH = 215;

      if (canvas.width !== logicalW * dpr || canvas.height !== logicalH * dpr) {
        canvas.width = logicalW * dpr;
        canvas.height = logicalH * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, logicalW, logicalH);

      // Cycle time (3.4 seconds per full biomechanical rep)
      const elapsedSec = ((now - startTime) / 1000) * speedMultiplier;
      const t = (elapsedSec % 3.4) / 3.4;
      const pulse = (1 + Math.sin(elapsedSec * 4.5)) / 2;

      const skel = computeBiomechanicalPose(pose, t);
      setLivePhaseText(skel.phaseLabel);

      // 1. Studio Floor Horizon & Dynamic Ground Shadow
      const floorGrad = ctx.createLinearGradient(0, 184, 0, 215);
      floorGrad.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
      floorGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 188, logicalW, 27);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 190);
      ctx.lineTo(320, 190);
      ctx.stroke();

      // Dynamic soft shadow under athlete
      const shadowCenterX = (skel.hip.x + skel.ankle.x) / 2;
      const shadowGrad = ctx.createRadialGradient(
        shadowCenterX,
        191,
        4,
        shadowCenterX,
        191,
        75
      );
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
      shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shadowGrad;
      ctx.beginPath();
      ctx.ellipse(shadowCenterX, 191, 72, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Studio Gym Equipment (Behind athlete)
      drawStudioEquipment(ctx, pose, skel);

      // 3. Back Limbs (for 3D depth perception)
      const backThighK = skel.kneeBack || { x: skel.knee.x - 6, y: skel.knee.y - 2 };
      const backAnkle = skel.ankleBack || { x: skel.ankle.x - 6, y: skel.ankle.y - 2 };
      drawAnatomicalLimb(
        ctx,
        skel.hip,
        backThighK,
        12,
        10.5,
        7.5,
        '#475569',
        '#64748b',
        showMuscleXray &&
          (skel.activeZones.includes('quads') || skel.activeZones.includes('hamstrings')),
        accentColor,
        pulse,
        true
      );
      drawAnatomicalLimb(
        ctx,
        backThighK,
        backAnkle,
        7.5,
        6.8,
        4.5,
        '#475569',
        '#64748b',
        showMuscleXray && skel.activeZones.includes('calves'),
        accentColor,
        pulse,
        true
      );

      if (skel.elbowBack && skel.wristBack) {
        drawAnatomicalLimb(
          ctx,
          skel.shoulder,
          skel.elbowBack,
          7.5,
          6.5,
          5,
          '#475569',
          '#64748b',
          showMuscleXray && skel.activeZones.includes('arms'),
          accentColor,
          pulse,
          true
        );
        drawAnatomicalLimb(
          ctx,
          skel.elbowBack,
          skel.wristBack,
          5,
          4.5,
          3.5,
          '#475569',
          '#64748b',
          false,
          accentColor,
          pulse,
          true
        );
      }

      // 4. Sculpted Anatomical Torso
      drawAnatomicalTorso(
        ctx,
        skel.hip,
        skel.shoulder,
        showMuscleXray ? skel.activeZones : [],
        accentColor,
        pulse
      );

      // 5. Front Leg (Thigh + Calf + Hip Flexor Glow)
      drawAnatomicalLimb(
        ctx,
        skel.hip,
        skel.knee,
        13,
        11.5,
        8,
        '#94a3b8',
        '#f1f5f9',
        showMuscleXray &&
          (skel.activeZones.includes('quads') ||
            skel.activeZones.includes('hamstrings') ||
            skel.activeZones.includes('hip_flexor')),
        accentColor,
        pulse,
        false
      );
      drawAnatomicalLimb(
        ctx,
        skel.knee,
        skel.ankle,
        8,
        7.2,
        5,
        '#94a3b8',
        '#e2e8f0',
        showMuscleXray && skel.activeZones.includes('calves'),
        accentColor,
        pulse,
        false
      );

      // 6. Head, Neck & Athletic Shoes
      drawHeadAndShoe(
        ctx,
        skel.neck,
        skel.head,
        skel.ankle,
        skel.toe,
        skel.ankleBack,
        skel.toeBack
      );

      // 7. Front Arm (Deltoid + Upper Arm + Forearm)
      drawAnatomicalLimb(
        ctx,
        skel.shoulder,
        skel.elbow,
        8.5,
        7.5,
        5.8,
        '#cbd5e1',
        '#f8fafc',
        showMuscleXray &&
          (skel.activeZones.includes('arms') || skel.activeZones.includes('shoulders')),
        accentColor,
        pulse,
        false
      );
      drawAnatomicalLimb(
        ctx,
        skel.elbow,
        skel.wrist,
        5.8,
        5.2,
        4,
        '#cbd5e1',
        '#f8fafc',
        showMuscleXray && skel.activeZones.includes('arms'),
        accentColor,
        pulse,
        false
      );

      // Deltoid cap highlight
      if (showMuscleXray && skel.activeZones.includes('shoulders')) {
        ctx.save();
        ctx.globalAlpha = 0.65 * (0.7 + 0.3 * pulse);
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(skel.shoulder.x, skel.shoulder.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. Isometric Tension Pulse Rings when Category === 'isometrisch'
      if (category === 'isometrisch' && showMuscleXray) {
        const focusJoint = skel.activeZones.includes('quads')
          ? {
              x: (skel.hip.x + skel.knee.x) / 2,
              y: (skel.hip.y + skel.knee.y) / 2,
            }
          : skel.activeZones.includes('arms')
          ? skel.elbow
          : {
              x: (skel.hip.x + skel.shoulder.x) / 2,
              y: (skel.hip.y + skel.shoulder.y) / 2,
            };

        ctx.save();
        const ringRadius = 14 + ((elapsedSec * 22) % 24);
        const ringAlpha = Math.max(0, 1 - (ringRadius - 14) / 24) * 0.55;
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = ringAlpha;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(focusJoint.x, focusJoint.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 9. Foreground Weights (Barbell / Dumbbell)
      drawForegroundWeights(ctx, pose, skel, accentColor);

      ctx.restore();
      animationFrameId = requestAnimationFrame(renderFrame);
    };

    animationFrameId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pose, category, accentColor, speedMultiplier, showMuscleXray]);

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#060911] border border-slate-800/90 overflow-hidden flex flex-col justify-between select-none shadow-inner`}
    >
      {/* Top Studio Controls Overlay */}
      <div className="relative z-10 flex items-center justify-between px-3 pt-2.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[10px] font-semibold text-slate-200 backdrop-blur-md">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
          <span>
            {category === 'isometrisch'
              ? '60 FPS Isometrie-Biomechanik'
              : category === 'dehnung'
              ? '60 FPS Mobility-Flow'
              : '60 FPS Muskel-Kinematik'}
          </span>
        </div>

        {/* Interactive Slow-Mo & Muscle Heatmap Toggles */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setShowMuscleXray((v) => !v)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
              showMuscleXray
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
            title="Zielmuskel-Aktivierung ein-/ausblenden"
          >
            Muskel-Fokus
          </button>
          <button
            type="button"
            onClick={() => setSpeedMultiplier((s) => (s === 1 ? 0.45 : 1))}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
              speedMultiplier < 1
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-400'
            }`}
            title="Zeitlupe (0.5x) für Technik-Studium"
          >
            {speedMultiplier < 1 ? '0.5× Slow-Mo' : '1× Tempo'}
          </button>
        </div>
      </div>

      {/* 60 FPS High-DPI Anatomical Canvas */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div
          className="absolute w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            backgroundColor: accentColor,
            transform: isActiveTimer ? 'scale(1.3)' : 'scale(1)',
          }}
        />
        <canvas
          ref={canvasRef}
          className="w-full h-full max-w-[340px] object-contain"
        />
      </div>

      {/* Bottom Live Biomechanical Coaching & Breathing Bar */}
      <div className="relative z-10 px-3 pb-2 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-2">
        <span className="text-[11px] font-medium text-slate-300 truncate">
          {livePhaseText}
        </span>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-sky-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-breath-dot" />
          <span>4s Ein · 4s Aus</span>
        </div>
      </div>
    </div>
  );
};
