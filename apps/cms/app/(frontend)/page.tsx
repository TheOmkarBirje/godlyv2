export default function CmsHomePage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Godly.Design CMS</h1>
      <p>
        Admin UI:{" "}
        <a href="/admin">/admin</a>
      </p>
      <p>
        REST API: <code>/api</code>
      </p>
    </main>
  );
}
