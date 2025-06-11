import { useEffect } from 'react';

export default function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `Trackd | ${title}`;
  }, [title]);

  return null;
}