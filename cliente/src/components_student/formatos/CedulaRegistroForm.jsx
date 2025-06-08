import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Save, User, Building, Briefcase, BookOpen } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import './CedulaRegistroForm.css';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  section: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#FF671F',
    color: 'white',
    padding: 3,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  field: {
    flex: 1,
    marginRight: 5,
  },
  fieldWide: {
    flex: 3,
  },
  label: {
    fontSize: 7,
    marginTop: 1,
    textAlign: 'center',
  },
  value: {
    fontSize: 9,
    padding: 1,
    backgroundColor: '#E1E1E1',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
    minHeight: 15,
  },
  signature: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 10,
  },
  signatureLabel: {
    fontSize: 7,
    textAlign: 'center',
  }
});

// PDF Document Component
const CedulaRegistroPDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Universidad Politécnica de Quintana Roo</Text>
        <Text style={styles.subtitle}>Dirección de Vinculación, Difusión y Extensión Universitaria</Text>
        <Text style={styles.subtitle}>Cédula de Registro</Text>
      </View>

      {/* Datos del Alumno */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Alumno/a:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.apellidoPaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Paterno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.apellidoMaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Materno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.nombres || ' '}</Text>
            <Text style={styles.label}>Nombre(s)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.telefono || ' '}</Text>
            <Text style={styles.label}>Teléfono</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.matricula || ' '}</Text>
            <Text style={styles.label}>Matrícula</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.carrera || ' '}</Text>
            <Text style={styles.label}>Carrera</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.emailPersonal || ' '}</Text>
            <Text style={styles.label}>E-mail (PERSONAL)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.emailInstitucional || ' '}</Text>
            <Text style={styles.label}>E-mail (UPQROO)</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.alumno.numeroSS || ' '}</Text>
            <Text style={styles.label}>No. SS</Text>
          </View>
          <View style={styles.fieldWide}>
            <Text style={styles.value}>{formData.alumno.direccion || ' '}</Text>
            <Text style={styles.label}>Dirección</Text>
          </View>
        </View>
      </View>

      {/* Datos de la Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos de la Empresa:</Text>
        <View style={styles.row}>
          <View style={styles.fieldWide}>
            <Text style={styles.value}>{formData.empresa.nombre || ' '}</Text>
            <Text style={styles.label}>Nombre Comercial o Público</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.giroComercial || ' '}</Text>
            <Text style={styles.label}>Giro</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.tamano || ' '}</Text>
            <Text style={styles.label}>Tipo</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.fieldWide}>
            <Text style={styles.value}>{formData.empresa.direccion || ' '}</Text>
            <Text style={styles.label}>Dirección</Text>
          </View>
        </View>
        
        <Text style={{fontSize: 10, marginTop: 5, marginBottom: 3}}>Responsable de RH:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.apellidoPaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Paterno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.apellidoMaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Materno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.nombre || ' '}</Text>
            <Text style={styles.label}>Nombre(s)</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.telefono || ' '}</Text>
            <Text style={styles.label}>Número</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.extension || ' '}</Text>
            <Text style={styles.label}>Ext</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.empresa.responsableRH.email || ' '}</Text>
            <Text style={styles.label}>E-mail</Text>
          </View>
        </View>
      </View>

      {/* Datos del Asesor Empresarial */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Asesor Empresarial:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.apellidoPaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Paterno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.apellidoMaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Materno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.nombre || ' '}</Text>
            <Text style={styles.label}>Nombre(s)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.puesto || ' '}</Text>
            <Text style={styles.label}>Cargo</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.telefono || ' '}</Text>
            <Text style={styles.label}>Número</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorEmpresarial.email || ' '}</Text>
            <Text style={styles.label}>E-mail</Text>
          </View>
          <View style={styles.field}>
            <View style={styles.signature}></View>
            <Text style={styles.signatureLabel}>Firma</Text>
          </View>
        </View>
      </View>

      {/* Datos del Asesor Académico */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Asesor Académico:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.apellidoPaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Paterno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.apellidoMaterno || ' '}</Text>
            <Text style={styles.label}>Apellido Materno</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.nombre || ' '}</Text>
            <Text style={styles.label}>Nombre(s)</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.puesto || ' '}</Text>
            <Text style={styles.label}>Cargo</Text>
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.telefono || ' '}</Text>
            <Text style={styles.label}>Número</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.value}>{formData.asesorAcademico.email || ' '}</Text>
            <Text style={styles.label}>E-mail</Text>
          </View>
          <View style={styles.field}>
            <View style={styles.signature}></View>
            <Text style={styles.signatureLabel}>Firma</Text>
          </View>
        </View>
      </View>

      {/* Datos del Proyecto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Proyecto:</Text>
        <View style={styles.row}>
          <View style={styles.fieldWide}>
            <Text style={styles.value}>{formData.proyecto.nombre || ' '}</Text>
            <Text style={styles.label}>Nombre Proyecto</Text>
          </View>
        </View>
      </View>

      {/* Firma del Alumno */}
      <View style={styles.row}>
        <View style={styles.field}></View>
        <View style={styles.field}>
          <View style={styles.signature}></View>
          <Text style={styles.signatureLabel}>Firma de alumno</Text>
        </View>
        <View style={styles.field}></View>
      </View>
    </Page>
  </Document>
);

const CedulaRegistroForm = () => {
  const [cedulaData, setCedulaData] = useState({
    alumno: {
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      telefono: '',
      matricula: '',
      carrera: '',
      emailPersonal: '',
      emailInstitucional: '',
      numeroSS: '',
      direccion: ''
    },
    empresa: {
      nombre: '',
      giroComercial: '',
      tamano: 'Micro',
      direccion: '',
      responsableRH: {
        apellidoPaterno: '',
        apellidoMaterno: '',
        nombre: '',
        telefono: '',
        extension: '',
        email: ''
      }
    },
    asesorEmpresarial: {
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombre: '',
      puesto: '',
      email: '',
      telefono: ''
    },
    asesorAcademico: {
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombre: '',
      puesto: '',
      email: '',
      telefono: ''
    },
    proyecto: {
      nombre: ''
    }
  });

  const [expandedSections, setExpandedSections] = useState({});
  const [isPdfReady, setIsPdfReady] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCedulaChange = (section, field, value, subsection = null) => {
    setCedulaData(prev => {
      if (subsection) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [subsection]: {
              ...prev[section][subsection],
              [field]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPdfReady(true);
  };

  const carreras = [
    'Ingeniería en Software',
    'Ingeniería Financiera',
    'Ingeniería Biomédica',
    'Licenciatura en Administración y Gestión de PyMEs',
    'Licenciatura en Terapia Física'
  ];

  const tamañosEmpresa = ['Micro', 'Pequeña', 'Mediana', 'Grande'];

  return (
    <div className="cedula-container">
      <div className="cedula-header">
        {/* Botón de regresar */}
<div className="cedula-back-button-wrapper">
  <button 
    type="button" 
    className="cedula-back-btn"
    onClick={() => window.history.back()}
  >
    <ChevronUp className="back-icon" />
    Regresar
  </button>
</div>

        <h1 className="cedula-title">Universidad Politécnica de Quintana Roo</h1>
        <h2 className="cedula-subtitle">Dirección de Vinculación, Difusión y Extensión Universitaria</h2>
        <h3 className="cedula-form-title">Cédula de Registro</h3>
      </div>

      <div className="cedula-form-wrapper">
        <form onSubmit={handleSubmit} className="cedula-form">
          {/* Datos del Alumno */}
          <div className="cedula-section">
            <div 
              className="cedula-section-header"
              onClick={() => toggleSection('alumno')}
            >
              <h3 className="cedula-section-title">
                <User className="section-icon" />
                Datos del Alumno/a
              </h3>
              {expandedSections.alumno ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.alumno !== false && (
              <div className="cedula-section-content">
                <div className="cedula-grid">
                  <div className="cedula-field">
                    <label>Apellido Paterno</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.apellidoPaterno}
                      onChange={(e) => handleCedulaChange('alumno', 'apellidoPaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('alumno', 'apellidoMaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre(s)</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.nombres}
                      onChange={(e) => handleCedulaChange('alumno', 'nombres', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.alumno.telefono}
                      onChange={(e) => handleCedulaChange('alumno', 'telefono', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Matrícula</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.matricula}
                      onChange={(e) => handleCedulaChange('alumno', 'matricula', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Programa Educativo</label>
                    <select
                      value={cedulaData.alumno.carrera}
                      onChange={(e) => handleCedulaChange('alumno', 'carrera', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {carreras.map((carrera) => (
                        <option key={carrera} value={carrera}>{carrera}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cedula-field">
                    <label>Correo Personal</label>
                    <input
                      type="email"
                      value={cedulaData.alumno.emailPersonal}
                      onChange={(e) => handleCedulaChange('alumno', 'emailPersonal', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Correo Institucional</label>
                    <input
                      type="email"
                      value={cedulaData.alumno.emailInstitucional}
                      onChange={(e) => handleCedulaChange('alumno', 'emailInstitucional', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Número de Seguridad Social</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.numeroSS}
                      onChange={(e) => handleCedulaChange('alumno', 'numeroSS', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field cedula-field-span-3">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.direccion}
                      onChange={(e) => handleCedulaChange('alumno', 'direccion', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos de la Empresa */}
          <div className="cedula-section">
            <div 
              className="cedula-section-header"
              onClick={() => toggleSection('empresa')}
            >
              <h3 className="cedula-section-title">
                <Building className="section-icon" />
                Datos de la Empresa
              </h3>
              {expandedSections.empresa ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.empresa !== false && (
              <div className="cedula-section-content">
                <div className="cedula-grid">
                  <div className="cedula-field cedula-field-span-2">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={cedulaData.empresa.nombre}
                      onChange={(e) => handleCedulaChange('empresa', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Giro Comercial</label>
                    <input
                      type="text"
                      value={cedulaData.empresa.giroComercial}
                      onChange={(e) => handleCedulaChange('empresa', 'giroComercial', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Tamaño</label>
                    <select
                      value={cedulaData.empresa.tamano}
                      onChange={(e) => handleCedulaChange('empresa', 'tamano', e.target.value)}
                    >
                      {tamañosEmpresa.map((tamano) => (
                        <option key={tamano} value={tamano}>{tamano}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cedula-field cedula-field-span-4">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={cedulaData.empresa.direccion}
                      onChange={(e) => handleCedulaChange('empresa', 'direccion', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="cedula-subsection">
                  <h4 className="cedula-subsection-title">Responsable de Recursos Humanos</h4>
                  <div className="cedula-grid">
                    <div className="cedula-field">
                      <label>Apellido Paterno</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.apellidoPaterno}
                        onChange={(e) => handleCedulaChange('empresa', 'apellidoPaterno', e.target.value, 'responsableRH')}
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Apellido Materno</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.apellidoMaterno}
                        onChange={(e) => handleCedulaChange('empresa', 'apellidoMaterno', e.target.value, 'responsableRH')}
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Nombre</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.nombre}
                        onChange={(e) => handleCedulaChange('empresa', 'nombre', e.target.value, 'responsableRH')}
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={cedulaData.empresa.responsableRH.telefono}
                        onChange={(e) => handleCedulaChange('empresa', 'telefono', e.target.value, 'responsableRH')}
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Extensión</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.extension}
                        onChange={(e) => handleCedulaChange('empresa', 'extension', e.target.value, 'responsableRH')}
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Correo</label>
                      <input
                        type="email"
                        value={cedulaData.empresa.responsableRH.email}
                        onChange={(e) => handleCedulaChange('empresa', 'email', e.target.value, 'responsableRH')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos del Asesor Empresarial */}
          <div className="cedula-section">
            <div 
              className="cedula-section-header"
              onClick={() => toggleSection('asesorEmpresarial')}
            >
              <h3 className="cedula-section-title">
                <Briefcase className="section-icon" />
                Datos del Asesor Empresarial
              </h3>
              {expandedSections.asesorEmpresarial ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.asesorEmpresarial !== false && (
              <div className="cedula-section-content">
                <div className="cedula-grid">
                  <div className="cedula-field">
                    <label>Apellido Paterno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.apellidoPaterno}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'apellidoPaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'apellidoMaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.nombre}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Puesto</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.puesto}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'puesto', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Correo</label>
                    <input
                      type="email"
                      value={cedulaData.asesorEmpresarial.email}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'email', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.asesorEmpresarial.telefono}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'telefono', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos del Asesor Académico */}
          <div className="cedula-section">
            <div 
              className="cedula-section-header"
              onClick={() => toggleSection('asesorAcademico')}
            >
              <h3 className="cedula-section-title">
                <BookOpen className="section-icon" />
                Datos del Asesor Académico
              </h3>
              {expandedSections.asesorAcademico ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.asesorAcademico !== false && (
              <div className="cedula-section-content">
                <div className="cedula-grid">
                  <div className="cedula-field">
                    <label>Apellido Paterno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.apellidoPaterno}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'apellidoPaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'apellidoMaterno', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.nombre}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Puesto</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.puesto}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'puesto', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Correo</label>
                    <input
                      type="email"
                      value={cedulaData.asesorAcademico.email}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'email', e.target.value)}
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.asesorAcademico.telefono}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'telefono', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Datos del Proyecto */}
          <div className="cedula-section">
            <div 
              className="cedula-section-header"
              onClick={() => toggleSection('proyecto')}
            >
              <h3 className="cedula-section-title">
                <FileText className="section-icon" />
                Datos del Proyecto
              </h3>
              {expandedSections.proyecto ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.proyecto !== false && (
              <div className="cedula-section-content">
                <div className="cedula-field">
                  <label>Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={cedulaData.proyecto.nombre}
                    onChange={(e) => handleCedulaChange('proyecto', 'nombre', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="cedula-submit-wrapper">
            <button type="submit" className="cedula-submit-btn">
              <Save className="btn-icon" />
              Preparar PDF
            </button>
            
            {isPdfReady && (
              <PDFDownloadLink
                document={<CedulaRegistroPDF formData={cedulaData} />}
                fileName="cedula_registro.pdf"
                className="cedula-download-btn"
              >
                {({ blob, url, loading, error }) =>
                  loading ? 'Generando PDF...' : 'Descargar PDF'
                }
              </PDFDownloadLink>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CedulaRegistroForm;