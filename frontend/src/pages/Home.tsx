import PageTitle from "../components/PageTitle";
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
    <PageTitle title="Home"/>
    <div className="min-h-screen text-white flex flex-col">
  
  <section
    className="min-h-screen w-full bg-[url('/Designer.jpg')] bg-cover bg-[position:50%_20%] flex flex-col justify-center items-center text-center px-6"
>
  
    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-400 drop-shadow-lg">
      Bienvenido a Trackd
    </h1>
    <p className="text-lg md:text-xl max-w-xl text-white/90 mb-6 drop-shadow">
      Administra y lleva el control de todas tus series en un solo lugar. Fácil, rápido y seguro.
    </p>
    <Link
      to="/login"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
    >
      Comienza ahora
    </Link>
  </section>

  <section className="py-16 px-6 bg-[#1e293b] text-center">
    <h2 className="text-3xl font-bold mb-10 text-blue-300">¿Qué puedes hacer?</h2>
    <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
      <div>
        <h3 className="text-xl font-semibold mb-2">📚 Registra tus series</h3>
        <p className="text-gray-300">Lleva un control de lo que estás viendo y lo que ya terminaste.</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">🧠 No olvides tu progreso</h3>
        <p className="text-gray-300">Guarda en qué episodio te quedaste para retomarlo fácilmente.</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">📱 Accede desde donde sea</h3>
        <p className="text-gray-300">Todo está en la nube. Solo inicia sesión y continúa donde lo dejaste.</p>
      </div>
    </div>
  </section>

</div>

    </>
  );
}

  