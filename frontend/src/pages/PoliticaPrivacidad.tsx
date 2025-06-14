import React from "react";

const PoliticaPrivacidad: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 text-white bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

      <p className="mb-4">
        En cumplimiento de la Ley Orgánica 3/2018, de 5 de diciembre, de
        Protección de Datos Personales y garantía de los derechos digitales
        (LOPDGDD) y el Reglamento (UE) 2016/679 del Parlamento Europeo y del
        Consejo (GDPR), informamos a los usuarios de la aplicación Trackd
        sobre el tratamiento de sus datos personales.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Responsable del tratamiento</h2>
      <p className="mb-4">
        <strong>Nombre:</strong> Alejandro Vidal Gómez<br />
        <strong>Email:</strong>{" "}
        <a
          href="mailto:alejandrovg980@gmail.com"
          className="text-blue-600 underline"
        >
          alejandrovg980@gmail.com
        </a>
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Finalidad del tratamiento</h2>
      <p className="mb-4">
        Los datos personales proporcionados serán utilizados exclusivamente para:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Gestionar el registro y autenticación de usuarios.</li>
        <li>Proporcionar acceso a funcionalidades personalizadas.</li>
        <li>Mejorar la experiencia de usuario.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Legitimación</h2>
      <p className="mb-4">
        El tratamiento de los datos se basa en el consentimiento del usuario y,
        en su caso, en la ejecución de un contrato para el uso de la plataforma.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Destinatarios</h2>
      <p className="mb-4">
        No se cederán datos a terceros, salvo obligación legal o en caso de ser
        necesarios para la prestación del servicio (por ejemplo, proveedores de hosting).
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Derechos del usuario</h2>
      <p className="mb-4">
        El usuario puede ejercer en cualquier momento sus derechos de acceso,
        rectificación, supresión, oposición, limitación del tratamiento y
        portabilidad enviando una solicitud al correo electrónico indicado arriba.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Conservación de los datos</h2>
      <p className="mb-4">
        Los datos se conservarán mientras el usuario mantenga su cuenta activa y,
        posteriormente, durante los plazos legales establecidos.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Medidas de seguridad</h2>
      <p className="mb-4">
        Se aplican las medidas técnicas y organizativas necesarias para garantizar
        la seguridad de los datos y evitar su alteración, pérdida, tratamiento o
        acceso no autorizado.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Modificaciones</h2>
      <p className="mb-4">
        Nos reservamos el derecho de modificar esta política de privacidad en
        cualquier momento. Los cambios se comunicarán debidamente en la
        plataforma.
      </p>
    </div>
  );
};

export default PoliticaPrivacidad;
