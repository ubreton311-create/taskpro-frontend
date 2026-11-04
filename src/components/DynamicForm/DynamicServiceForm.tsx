import { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import type { FormValues, ServiceFormSchema } from '../../schemas/form-schema';
import { getInitialValues } from '../../schemas/form-schema';

interface Props {
  schema: ServiceFormSchema;
  onSubmit: (values: FormValues) => void | Promise<void>;
}

export default function DynamicServiceForm({ schema, onSubmit }: Props) {
  const [values, setValues] = useState<FormValues>(() => getInitialValues(schema));
  const [submitting, setSubmitting] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    handleChange(fieldName, fileArray);

    // Crear URLs de vista previa
    const newPreviews = fileArray.map(file => URL.createObjectURL(file));
    setPreviews(prev => ({ ...prev, [fieldName]: newPreviews }));
  };

  const removeFile = (fieldName: string, index: number) => {
    const currentFiles = (values[fieldName] as File[]) || [];
    const newFiles = currentFiles.filter((_, i) => i !== index);
    handleChange(fieldName, newFiles);

    const currentPreviews = previews[fieldName] || [];
    const newPreviews = currentPreviews.filter((_, i) => i !== index);
    setPreviews(prev => ({ ...prev, [fieldName]: newPreviews }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {schema.fields.map((field) => (
        <div key={field.name}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#252136', marginBottom: '8px' }}>
            {field.label} {field.required && <span style={{ color: '#e11d48' }}>*</span>}
          </label>
          
          {field.type === 'number' && (
            <input
              type="number"
              required={field.required}
              value={values[field.name] as number}
              onChange={(e) => handleChange(field.name, Number(e.target.value))}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px' }}
            />
          )}

          {field.type === 'select' && (
            <select
              required={field.required}
              value={values[field.name] as string}
              onChange={(e) => handleChange(field.name, e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '15px', backgroundColor: '#fff' }}
            >
              {field.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          )}

          {field.type === 'photos' && (
            <div>
              {/* TARJETA DE SUBIDA PREMIUM */}
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  required={field.required && (!values[field.name] || (values[field.name] as File[]).length === 0)}
                  onChange={(e) => handleFileChange(field.name, e.target.files)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                <UploadCloud size={40} color="#7a2fbf" style={{ margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>Haz clic o arrastra tus fotos aquí</p>
                <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>Formatos JPG, PNG. Máximo 5MB por foto.</p>
              </div>

              {/* VISTA PREVIA (THUMBNAILS) */}
              {previews[field.name] && previews[field.name].length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '15px' }}>
                  {previews[field.name].map((src, index) => (
                    <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '80px', border: '1px solid #e2e8f0' }}>
                      <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => removeFile(field.name, index)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'grid', placeItems: 'center', cursor: 'pointer' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <button type="submit" disabled={submitting} style={{ background: '#7a2fbf', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 700, fontSize: '16px', border: 'none', marginTop: '10px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(122, 47, 191, 0.3)' }}>
        {submitting ? 'Calculando y Subiendo...' : 'Solicitar Cotización'}
      </button>
    </form>
  );
}