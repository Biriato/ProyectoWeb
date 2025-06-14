import React from "react";

const AvisoLegal: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Aviso Legal</h1>

      <p className="mb-4">
        En cumplimiento con el deber de información recogido en el artículo 10
        de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la
        Información y del Comercio Electrónico (LSSICE), se informa que:
      </p>

      <p className="mb-4">
        <strong>Responsable:</strong> Alejandro Vidal Gómez
        <br />
        <strong>Email:</strong>{" "}
        <a
          href="mailto:alejandrovg980@gmail.com"
          className="text-blue-600 underline"
        >
          alejandrovg980@gmail.com
        </a>
        <br />
        <strong>Nombre comercial:</strong> Trackd
      </p>

      <p className="mb-4">
        El presente sitio web tiene por objeto ofrecer una plataforma para la
        gestión y seguimiento de series por parte de usuarios registrados.
      </p>

      <p className="mb-4">
        El acceso y/o uso de este portal atribuye la condición de usuario, que
        acepta, desde dicho acceso y/o uso, las condiciones generales de uso
        aquí reflejadas. Las citadas condiciones serán de aplicación
        independientemente de las condiciones generales de contratación que en
        su caso resulten de obligado cumplimiento.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Propiedad Intelectual</h2>
      <p className="mb-4">
        Todos los contenidos del sitio web, incluyendo, sin carácter
        limitativo, los textos, documentos, fotografías, dibujos,
        representaciones gráficas, bases de datos, programas informáticos, así
        como logotipos, marcas, nombres comerciales u otros signos distintivos,
        son propiedad del titular del sitio web o de terceros que han autorizado
        su uso.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Responsabilidad</h2>
      <p className="mb-4">
        El responsable no se hace responsable, en ningún caso, de los daños y
        perjuicios de cualquier naturaleza que pudieran ocasionar, a título
        enunciativo: errores u omisiones en los contenidos, falta de
        disponibilidad del portal o la transmisión de virus o programas
        maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas
        las medidas tecnológicas necesarias para evitarlo.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Legislación aplicable</h2>
      <p className="mb-4">
        La relación entre el titular del sitio web y el usuario se regirá por la
        normativa española vigente. Cualquier controversia se someterá a los
        Juzgados y tribunales de la ciudad de residencia del titular, salvo que
        la Ley disponga otra cosa.
      </p>
    </div>
  );
};

export default AvisoLegal;
