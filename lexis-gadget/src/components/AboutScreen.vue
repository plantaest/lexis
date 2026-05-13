<template>
  <div class="container">
    <div class="header">
      <div class="logo">Lexis</div>
      <ul class="link-list">
        <li class="link-item">
          <a
            class="cdx-docs-link"
            href="https://vi.wikipedia.org/wiki/User:Plantaest/Lexis"
            target="_blank"
            >Trang chính</a
          >
        </li>
        <li class="link-item">
          <a
            class="cdx-docs-link"
            href="https://vi.wikipedia.org/wiki/User_talk:Plantaest/Lexis"
            target="_blank"
            >Thảo luận</a
          >
        </li>
        <li class="link-item">
          <a class="cdx-docs-link" href="https://github.com/plantaest/lexis" target="_blank"
            >Mã nguồn</a
          >
        </li>
      </ul>
    </div>
    <div class="footer">
      {{ new Date().getFullYear() }} ©
      <a class="cdx-docs-link" href="https://meta.wikimedia.org/wiki/User:Plantaest" target="_blank"
        >Plantaest</a
      >
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
  padding: 2rem 0.25rem;
  justify-content: space-between;
  height: 100%;
  overflow-y: auto;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.logo {
  font-size: 2.25rem;
  font-family: 'Palatino Linotype', 'Palatino', 'Times New Roman', 'Times', serif;
}

.link-list {
  display: inline;
  letter-spacing: -1em;
  margin: 0;
  padding: 0;
}

.link-item {
  display: inline;
  letter-spacing: normal;

  &:not(:last-child)::after {
    padding: 0 0.35em;
    content: '·';
    font-weight: bold;
  }
}
</style>
