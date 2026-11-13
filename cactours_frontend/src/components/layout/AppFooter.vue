<template>
  <footer id="contacto" class="footer">
    <div class="container footer-inner">
      <div>
        <h3 class="footer-title">Cactours</h3>
        <p>Experiencias auténticas en La Guajira y los mejores destinos de Colombia.</p>
      </div>
      <div>
        <p><strong>Contacto:</strong></p>
        <p>Email: info@cactours.com</p>
        <p>Dirección: La Guajira, Colombia</p>
      </div>
    </div>
    <div class="container footer-copy">
      <p>&copy; 2026 Cactours. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-carbon);
  color: var(--color-blanco);
  padding: 2.5rem 0 1.5rem;
  margin-top: 3rem;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-title {
  color: var(--color-blanco);
  margin-bottom: 0.5rem;
}

.footer-copy {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: 1.5rem;
  padding-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.85;
}
</style>
