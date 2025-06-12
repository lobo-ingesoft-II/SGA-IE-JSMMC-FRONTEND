import { FormData } from '../../models/autenticacion/prematriculaModel';

const FASTAPI_URL = 'http://localhost:8010';
const PDF_SERVICE_URL = 'http://localhost:8015';

export async function preRegistrar(form: FormData): Promise<string> {
  const res = await fetch(`${FASTAPI_URL}/pre_registration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  });
  if (!res.ok) throw new Error(`Error al registrar (status ${res.status})`);
  const data = await res.json();
  return data._id;
}

export async function generarPdfPreRegistro(id: string): Promise<Blob> {
  const res = await fetch(`${PDF_SERVICE_URL}/pdf_pre_registro/${id}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Error al generar PDF (status ${res.status})`);
  return res.blob();
}