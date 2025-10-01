import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Save, User, Building, Briefcase, BookOpen, HelpCircle } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import './CedulaRegistroForm.css';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  logo: {
    width: 80,
    height: 40,
  },
  headerText: {
    textAlign: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
  },
  registro: {
    backgroundColor: '#4A2C2A',
    color: 'white',
    padding: 2,
    textAlign: 'center',
  },
  metaData: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    fontSize: 8,
    marginTop: 2,
  },
  metaItem: {
    marginLeft: 10,
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
  },
  signatureSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '100%',
    height: 20,
    marginBottom: 5,
  },
  signatureLabelFinal: {
    fontSize: 9,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

// Componente de Tooltip
const Tooltip = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="tooltip-container" style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: 'help' }}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="tooltip-content" style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          maxWidth: '250px',
          whiteSpace: 'normal',
          textAlign: 'center'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #333'
          }}></div>
        </div>
      )}
    </div>
  );
};

// PDF Document Component
const CedulaRegistroPDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image style={styles.logo} src="/logoUNI.png" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Universidad Politécnica de Quintana Roo</Text>
          <Text style={styles.subtitle}>Dirección de Vinculación, Difusión y Extensión Universitaria</Text>
          <Text style={styles.subtitle}>Cédula de Registro</Text>
        </View>

      </View>
      <View style={styles.metaData}>
        <Text style={styles.metaItem}>Fecha emisión: abril 2022</Text>
        <Text style={styles.metaItem}>Versión: 01</Text>
        <Text style={styles.metaItem}>Última actualización: N/A</Text>
        <Text style={styles.metaItem}>Página: 1 de 1</Text>
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

        <Text style={{ fontSize: 10, marginTop: 5, marginBottom: 3 }}>Responsable de RH:</Text>
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

      {/* Sección de Firmas Mejorada */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>FIRMAS DE AUTORIZACIÓN</Text>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>
              {`${formData.alumno.nombres} ${formData.alumno.apellidoPaterno} ${formData.alumno.apellidoMaterno}`.trim() || '_________________________'}
            </Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabelFinal}>NOMBRE Y FIRMA DEL ESTUDIANTE</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>
              {`${formData.asesorAcademico.nombre} ${formData.asesorAcademico.apellidoPaterno} ${formData.asesorAcademico.apellidoMaterno}`.trim() || '_________________________'}
            </Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabelFinal}>NOMBRE Y FIRMA DEL ASESOR ACADÉMICO</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>
              {`${formData.asesorEmpresarial.nombre} ${formData.asesorEmpresarial.apellidoPaterno} ${formData.asesorEmpresarial.apellidoMaterno}`.trim() || '_________________________'}
            </Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabelFinal}>NOMBRE Y FIRMA DEL ASESOR EMPRESARIAL</Text>
          </View>
        </View>
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
    'Licenciatura en Administración y Gestión Empresarial',
    'Licenciatura en Terapia Física',
    'Ingeniería en Biotecnología'
  ];

  const tamañosEmpresa = ['Pequeña', 'Mediana', 'Grande'];

  const girosComerciales = [
    'Tecnología y Software',
    'Turismo y Hotelería',
    'Salud y Medicina',
    'Educación',
    'Comercio al por menor',
    'Comercio al por mayor',
    'Restaurantes y Alimentos',
    'Construcción',
    'Manufacturas',
    'Servicios Financieros',
    'Inmobiliario',
    'Transporte y Logística',
    'Comunicaciones',
    'Energía',
    'Agricultura',
    'Otro'
  ];

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
                Información Personal
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
                      placeholder="Ej. García"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('alumno', 'apellidoMaterno', e.target.value)}
                      placeholder="Ej. López"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre(s)</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.nombres}
                      onChange={(e) => handleCedulaChange('alumno', 'nombres', e.target.value)}
                      placeholder="Ej. María Fernanda"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.alumno.telefono}
                      onChange={(e) => handleCedulaChange('alumno', 'telefono', e.target.value)}
                      placeholder="Ej. 998-123-4567"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Matrícula</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.matricula}
                      onChange={(e) => handleCedulaChange('alumno', 'matricula', e.target.value)}
                      placeholder="Ej. 2021010123"
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
                      placeholder="Ej. maria.garcia@gmail.com"
                    />
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Tu correo institucional que termina en @upqroo.edu.mx">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Correo Institucional <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="email"
                      value={cedulaData.alumno.emailInstitucional}
                      onChange={(e) => handleCedulaChange('alumno', 'emailInstitucional', e.target.value)}
                      placeholder="Ej. 2021010123@upqroo.edu.mx"
                    />
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Número de afiliación al Instituto Mexicano del Seguro Social (11 dígitos)">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Número de Seguridad Social <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={cedulaData.alumno.numeroSS}
                      onChange={(e) => handleCedulaChange('alumno', 'numeroSS', e.target.value)}
                      placeholder="Ej. 12345678901"
                    />
                  </div>
                  <div className="cedula-field cedula-field-span-3">
                    <label>Dirección Completa</label>
                    <input
                      type="text"
                      value={cedulaData.alumno.direccion}
                      onChange={(e) => handleCedulaChange('alumno', 'direccion', e.target.value)}
                      placeholder="Ej. Av. Principal #123, Col. Centro, Cancún, Q.R., C.P. 77500"
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
                Información de la Empresa
              </h3>
              {expandedSections.empresa ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.empresa !== false && (
              <div className="cedula-section-content">
                <div className="cedula-grid">
                  <div className="cedula-field cedula-field-span-2">
                    <label>Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={cedulaData.empresa.nombre}
                      onChange={(e) => handleCedulaChange('empresa', 'nombre', e.target.value)}
                      placeholder="Ej. Hotel Xcaret México, OXXO, Grupo Vidanta"
                    />
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Sector o tipo de actividad económica principal de la empresa">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Giro Comercial <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <select
                      value={cedulaData.empresa.giroComercial}
                      onChange={(e) => handleCedulaChange('empresa', 'giroComercial', e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {girosComerciales.map((giro) => (
                        <option key={giro} value={giro}>{giro}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Clasificación por número de empleados: Micro (1-10), Pequeña (11-50), Mediana (51-250), Grande (250+)">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Tamaño <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
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
                    <label>Dirección de la Empresa</label>
                    <input
                      type="text"
                      value={cedulaData.empresa.direccion}
                      onChange={(e) => handleCedulaChange('empresa', 'direccion', e.target.value)}
                      placeholder="Ej. Blvd. Kukulcán Km 8.5, Zona Hotelera, Cancún, Q.R."
                    />
                  </div>
                </div>

                <div className="cedula-subsection">
                  <Tooltip text="Persona encargada del departamento de personal y contrataciones">
                    <h4 className="cedula-subsection-title" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      Responsable de Recursos Humanos <HelpCircle size={16} color="#666" />
                    </h4>
                  </Tooltip>
                  <div className="cedula-grid">
                    <div className="cedula-field">
                      <label>Apellido Paterno</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.apellidoPaterno}
                        onChange={(e) => handleCedulaChange('empresa', 'apellidoPaterno', e.target.value, 'responsableRH')}
                        placeholder="Ej. Hernández"
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Apellido Materno</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.apellidoMaterno}
                        onChange={(e) => handleCedulaChange('empresa', 'apellidoMaterno', e.target.value, 'responsableRH')}
                        placeholder="Ej. Méndez"
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Nombre(s)</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.nombre}
                        onChange={(e) => handleCedulaChange('empresa', 'nombre', e.target.value, 'responsableRH')}
                        placeholder="Ej. Ana Patricia"
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Teléfono</label>
                      <input
                        type="tel"
                        value={cedulaData.empresa.responsableRH.telefono}
                        onChange={(e) => handleCedulaChange('empresa', 'telefono', e.target.value, 'responsableRH')}
                        placeholder="Ej. 998-876-5432"
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Extensión</label>
                      <input
                        type="text"
                        value={cedulaData.empresa.responsableRH.extension}
                        onChange={(e) => handleCedulaChange('empresa', 'extension', e.target.value, 'responsableRH')}
                        placeholder="Ej. 1234"
                      />
                    </div>
                    <div className="cedula-field">
                      <label>Correo</label>
                      <input
                        type="email"
                        value={cedulaData.empresa.responsableRH.email}
                        onChange={(e) => handleCedulaChange('empresa', 'email', e.target.value, 'responsableRH')}
                        placeholder="Ej. rh@empresa.com"
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
                Supervisor en la Empresa
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
                      placeholder="Ej. Rodríguez"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'apellidoMaterno', e.target.value)}
                      placeholder="Ej. Silva"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre(s)</label>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.nombre}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'nombre', e.target.value)}
                      placeholder="Ej. Carlos Eduardo"
                    />
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Cargo o posición que ocupa en la empresa">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Puesto <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={cedulaData.asesorEmpresarial.puesto}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'puesto', e.target.value)}
                      placeholder="Ej. Gerente de Sistemas, Jefe de Ventas, Coordinador"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Correo</label>
                    <input
                      type="email"
                      value={cedulaData.asesorEmpresarial.email}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'email', e.target.value)}
                      placeholder="Ej. carlos.rodriguez@empresa.com"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.asesorEmpresarial.telefono}
                      onChange={(e) => handleCedulaChange('asesorEmpresarial', 'telefono', e.target.value)}
                      placeholder="Ej. 998-765-4321"
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
                Asesor Académico
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
                      placeholder="Ej. Morales"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Apellido Materno</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.apellidoMaterno}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'apellidoMaterno', e.target.value)}
                      placeholder="Ej. Vázquez"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Nombre(s)</label>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.nombre}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'nombre', e.target.value)}
                      placeholder="Ej. Luis Fernando"
                    />
                  </div>
                  <div className="cedula-field">
                    <Tooltip text="Grado académico y cargo en la universidad">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Puesto <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={cedulaData.asesorAcademico.puesto}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'puesto', e.target.value)}
                      placeholder="Ej. Dr. en Ingeniería, Profesor Investigador"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Correo</label>
                    <input
                      type="email"
                      value={cedulaData.asesorAcademico.email}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'email', e.target.value)}
                      placeholder="Ej. luis.morales@upqroo.edu.mx"
                    />
                  </div>
                  <div className="cedula-field">
                    <label>Teléfono</label>
                    <input
                      type="tel"
                      value={cedulaData.asesorAcademico.telefono}
                      onChange={(e) => handleCedulaChange('asesorAcademico', 'telefono', e.target.value)}
                      placeholder="Ej. 998-654-3210"
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
                Proyecto a Desarrollar
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
                    placeholder="Ej. Sistema de inventario web, Optimización de procesos de ventas, App móvil para clientes"
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