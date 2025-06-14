import { useEffect } from 'react';
//Funcion para cambiar el titulo de la pagina actual
export default function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `Trackd | ${title}`;
  }, [title]);

  return null;
}