import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { ContactsService, ContactFormData } from '../services/contacts.service';

const FIELDS: {
  name: keyof ContactFormData;
  label: string;
  placeholder: string;
  required: boolean;
  type?: string;
}[] = [
    { name: 'fullName', label: 'Nombre completo', placeholder: 'María García', required: true },
    { name: 'email', label: 'Correo electrónico', placeholder: 'maria@empresa.com', required: true, type: 'email' },
    { name: 'phone', label: 'Teléfono', placeholder: '+52 55 0000 0000', required: false },
    { name: 'company', label: 'Empresa', placeholder: 'Hubox S.A. de C.V.', required: false },
  ];

export default function ContactFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>();

  const onSubmit = useCallback(async (data: ContactFormData) => {
    if (!executeRecaptcha) {
      toast.error('reCAPTCHA no está listo. Intenta de nuevo.');
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('contact_form');
      console.log('reCAPTCHA token:', recaptchaToken);
      console.log('token length:', recaptchaToken?.length);
      await ContactsService.submit({ ...data, recaptchaToken });
      setSubmitted(true);
      toast.success('¡Mensaje enviado con éxito!');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al enviar. Intenta de nuevo.';
      toast.error(msg);
    }
  }, [executeRecaptcha]);

  if (submitted) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-800">¡Gracias por contactarnos!</h2>
          <p className="text-sm text-slate-500">Nuestro equipo se pondrá en contacto contigo pronto.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
            Disrupción Digital
          </span>
          <h1 className="text-3xl font-bold text-slate-800">Hablemos de tu proyecto</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cuéntanos qué necesitas y te contactamos en menos de 24h.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-white p-6 shadow-lg space-y-4 sm:p-8"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(({ name, label, placeholder, required, type = 'text' }) => (
              <div key={name}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {label} {required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  className={`input-field ${errors[name] ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  {...register(name, {
                    required: required ? 'Este campo es requerido' : false,
                    ...(type === 'email' && {
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Email inválido' },
                    }),
                  })}
                />
                {errors[name] && (
                  <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Mensaje <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Cuéntanos sobre tu proyecto o necesidad..."
              className={`input-field resize-none ${errors.message ? 'border-red-300' : ''}`}
              {...register('message', {
                required: 'El mensaje es requerido',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' },
              })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Enviando...
              </>
            ) : (
              'Enviar mensaje'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}