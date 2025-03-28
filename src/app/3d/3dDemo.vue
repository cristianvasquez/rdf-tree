<script setup>

import { onMounted } from 'vue'

onMounted(() => {
  const rotatable = document.getElementById('rotatable')
  let isDragging = false
  let previousX = 0
  let previousY = 0
  let currentRotationX = 0
  let currentRotationY = 0

  // When mouse button is pressed
  document.addEventListener('mousedown', (event) => {
    isDragging = true
    previousX = event.clientX
    previousY = event.clientY
  })

  // When mouse is moving
  document.addEventListener('mousemove', (event) => {
    if (!isDragging) return

    // Calculate the difference in mouse position
    const deltaX = event.clientX - previousX
    const deltaY = event.clientY - previousY

    // Update rotation based on mouse movement
    // Reduced sensitivity by dividing by 10
    currentRotationY += deltaX / 10
    currentRotationX -= deltaY / 10

    // Limit rotation range
    currentRotationX = Math.max(Math.min(currentRotationX, 15), -15)
    currentRotationY = Math.max(Math.min(currentRotationY, 15), -15)

    rotatable.style.transform = `
      translate(-50%, -50%)
      rotateX(${currentRotationX}deg)
      rotateY(${currentRotationY}deg)
    `

    previousX = event.clientX
    previousY = event.clientY
  })

  // When mouse button is released
  document.addEventListener('mouseup', () => {
    isDragging = false
  })

  // When mouse leaves the window
  document.addEventListener('mouseleave', () => {
    isDragging = false
  })
})
</script>

<template>

  <!-- 3D Demo container -->
  <div style="
    perspective: 1000px;
    height: 300px;
    border: 2px solid #ccc;
    margin: 20px;
    background: #f5f5f5;
  ">
    <div
        id="rotatable"
        style="
        transform-style: preserve-3d;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      "
    >
      <div style="
        position: absolute;
        transform: translateZ(0px) translate(-50%, -50%);
        background: rgba(0, 100, 255, 0.2);
        padding: 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      ">Layer 1
      </div>

      <div style="
        position: absolute;
        transform: translateZ(50px) translate(-50%, -50%);
        background: rgba(255, 100, 0, 0.2);
        padding: 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      ">Layer 2
      </div>

      <div style="
        position: absolute;
        transform: translateZ(100px) translate(-50%, -50%);
        background: rgba(0, 255, 100, 0.2);
        padding: 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      ">Layer 3
      </div>
    </div>
  </div>


</template>

