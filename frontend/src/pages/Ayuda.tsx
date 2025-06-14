import React from "react";

const AyudaUsuario: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 text-white bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Centro de Ayuda - Trackd</h1>

      {/* Sección 1: Registro */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">1. ¿Cómo registrarse en Trackd?</h2>
        <p className="mb-4">
          Para comenzar a usar Trackd, necesitas crear una cuenta. Solo debes ingresar tu nombre, correo electrónico y una contraseña segura.
        </p>
        <img
          src="/registro.png" // Reemplaza con tu ruta local o URL
          alt="Pantalla de registro"
          className="rounded-lg shadow-md mb-4 w-full"
        />
      </section>

      {/* Sección 2: Iniciar sesión */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">2. Iniciar sesión</h2>
        <p className="mb-4">
          Una vez registrado, puedes iniciar sesión ingresando tu correo y contraseña en el formulario de login.
        </p>
        <img
          src="/inicio.png"
          alt="Pantalla de inicio de sesión"
          className="rounded-lg shadow-md mb-4 w-full"
        />
      </section>

      {/* Sección 3: Añadir una serie a tu lista */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">3. Agregar una serie a tu lista</h2>
        <p className="mb-4">
          Desde la biblioteca puedes buscar una serie , hacer click en ella para entrar a su pagina  y  hacer clic en “Agregar a mi lista”. Luego, puedes especificar el estado, la puntuación y el episodio actual.
        </p>
        <img
          src="/bib1.png"
          alt="Agregar serie a lista"
          className="rounded-lg shadow-md mb-4 w-full"
        />
        <img
          src="/bib2.png"
          alt="Agregar serie a lista"
          className="rounded-lg shadow-md mb-4 w-full"
        />
        <img
          src="/bib3.png"
          alt="Agregar serie a lista"
          className="rounded-lg shadow-md mb-4 w-full"
        />
      </section>

      {/* Sección 4: Editar progreso */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">4. Editar progreso de una serie</h2>
        <p className="mb-4">
          En tu lista personal puedes actualizar el número de episodios vistos, cambiar el estado de la serie o modificar la puntuación.
        </p>
        <img
          src="/edit1.png"
          alt="Editar progreso"
          className="rounded-lg shadow-md mb-4 w-full"
        />
        <img
          src="/edit2.png"
          alt="Editar progreso"
          className="rounded-lg shadow-md mb-4 w-full"
        />
      </section>

      {/* Sección 5: Eliminar una serie */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">5. Eliminar una serie de tu lista</h2>
        <p className="mb-4">
          Si ya no deseas seguir una serie, simplemente haz clic en “Eliminar” dentro de tu lista.
        </p>
        <img
          src="/edit1.png"
          alt="Eliminar serie"
          className="rounded-lg shadow-md mb-4 w-full"
        />
        <img
          src="/borrar.png"
          alt="Eliminar serie"
          className="rounded-lg shadow-md mb-4 w-full"
        />
      </section>

      {/* Contacto adicional */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">¿Necesitas más ayuda?</h2>
        <p className="mb-4">
          Puedes contactarnos en cualquier momento escribiendo a{" "}
          <a
            href="mailto:alejandrovg980@gmail.com"
            className="text-blue-600 underline"
          >
            alejandrovg980@gmail.com
          </a>
        </p>
      </section>
    </div>
  );
};

export default AyudaUsuario;
