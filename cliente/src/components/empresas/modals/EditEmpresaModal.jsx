import React, { useState, useEffect } from 'react';
import { X } from 'react-feather';

const EditEmpresaModal = ({ empresa, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    empresa_rfc: '',
    empresa_nombre: '',
    empresa_direccion: '',
    empresa_email: '',
    empresa_telefono: '',
    empresa_tamano: '',
    empresa_sociedad: '',
    empresa_pagina_web: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormData({
        empresa_rfc: empresa.empresa_rfc || '',
        empresa_nombre: empresa.empresa_nombre || '',
        empresa_direccion: empresa.empresa_direccion || '',
        empresa_email: empresa.empresa_email || '',
        empresa_telefono: empresa.empresa_telefono || '',
        empresa_tamano: empresa.empresa_tamano || '',
        empresa_sociedad: empresa.empresa_sociedad || 'Privada',
        empresa_pagina_web: empresa.empresa_pagina_web || ''
      });
    }
  }, [empresa]);

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['empresa_rfc', 'empresa_nombre', 'empresa_tamano', 'empresa_sociedad'];
    
    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Este campo es requerido';
      }
    });

    if (formData.empresa_email && !/\S+@\S+\.\S+/.test(formData.empresa_email)) {
      newErrors.empresa_email = 'Email inválido';
    }   
  
    if (!formData.empresa_rfc) newErrors.empresa_rfc = "RFC es requerido";
    if (!formData.empresa_nombre) newErrors.empresa_nombre = "Nombre es requerido";
    if (!formData.empresa_tamano) newErrors.empresa_tamano = "Seleccione un tamaño";
    if (!formData.empresa_sociedad) newErrors.empresa_sociedad = "Seleccione una sociedad";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsSubmitting(true);
    
    try {
      // Crear objeto con TODOS los campos, no solo los modificados
      const payload = {
        empresa_rfc: formData.empresa_rfc,
        empresa_nombre: formData.empresa_nombre,
        empresa_direccion: formData.empresa_direccion,
        empresa_email: formData.empresa_email,
        empresa_telefono: formData.empresa_telefono,
        empresa_tamano: formData.empresa_tamano,
        empresa_sociedad: formData.empresa_sociedad,
        empresa_pagina_web: formData.empresa_pagina_web
      };
  
      await onSave(empresa.id_empresa, payload);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold mb-6 text-orange-600">Editar Empresa</h3>
        
        {errors.submit && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <FormField
            label="RFC"
            name="empresa_rfc"
            value={formData.empresa_rfc}
            onChange={handleChange}
            error={errors.empresa_rfc}
            required
          />
          
          <FormField
            label="Nombre"
            name="empresa_nombre"
            value={formData.empresa_nombre}
            onChange={handleChange}
            error={errors.empresa_nombre}
            required
          />
          
          <FormField
            label="Dirección"
            name="empresa_direccion"
            value={formData.empresa_direccion}
            onChange={handleChange}
          />
          
          <FormField
            label="Email"
            name="empresa_email"
            type="email"
            value={formData.empresa_email}
            onChange={handleChange}
            error={errors.empresa_email}
          />
          
          <FormField
            label="Teléfono"
            name="empresa_telefono"
            value={formData.empresa_telefono}
            onChange={handleChange}
          />
          
          <SelectField
            label="Tamaño"
            name="empresa_tamano"
            value={formData.empresa_tamano}
            onChange={handleChange}
            options={['Grande', 'Mediana', 'Pequeña']}
            error={errors.empresa_tamano}
            required
          />
          
          <SelectField
            label="Sociedad"
            name="empresa_sociedad"
            value={formData.empresa_sociedad}
            onChange={handleChange}
            options={['Privada', 'Publica']}
            error={errors.empresa_sociedad}
            required
          />
          
          <FormField
            label="Página Web"
            name="empresa_pagina_web"
            value={formData.empresa_pagina_web}
            onChange={handleChange}
          />

          <div className="col-span-2 mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-500 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componentes auxiliares
const FormField = ({ label, name, type = 'text', value, onChange, error, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
        error ? 'border-red-500' : 'focus:ring-2 focus:ring-orange-500'
      }`}
      required={required}
    />
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none ${
        error ? 'border-red-500' : 'focus:ring-2 focus:ring-orange-500'
      }`}
      required={required}
    >
      <option value="">Seleccionar</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

export default EditEmpresaModal;