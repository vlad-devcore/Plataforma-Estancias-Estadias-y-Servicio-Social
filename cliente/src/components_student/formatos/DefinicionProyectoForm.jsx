import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, User, Building, Briefcase, Calendar, Send, HelpCircle } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import './DefinicionProyectoForm.css';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#7A2A05',
    color: 'white',
    padding: 3,
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  field: {
    flex: 1,
    marginRight: 5,
  },
  fieldWide: {
    flex: 2,
  },
  label: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    padding: 2,
    backgroundColor: '#E1E1E1',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
    minHeight: 18,
  },
  tableContainer: {
    marginTop: 5,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCol: {
    width: '33.33%', // 3 columnas
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableColWide: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 9,
    fontWeight: 'bold',
  },
  textArea: {
    fontSize: 9,
    padding: 5,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDD',
    minHeight: 40,
    marginBottom: 5,
  },
  signatureSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    flexShrink: 0, // Evita que se desplace a otra página
  },
  signatureTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 2,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    width: '100%',
    height: 15,
    marginBottom: 5,
  },
  signatureLabel: {
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
const DefinicionProyectoPDF = ({ formData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Universidad Politécnica de Quintana Roo</Text>
        <Text style={styles.subtitle}>Dirección de Vinculación, Difusión y Extensión Universitaria</Text>
        <Text style={styles.subtitle}>Definición de Proyecto</Text>
      </View>

      <View style={styles.infoHeader}>
        <Text style={{ fontSize: 10 }}>Proceso: {formData.proceso}</Text>
        <Text style={{ fontSize: 10 }}>Fecha y lugar: {formData.lugar} a {formData.fecha}</Text>
      </View>

      {/* Datos del Alumno */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Alumno:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{formData.alumno.nombre || ' '}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Grupo</Text>
            <Text style={styles.value}>{formData.alumno.grupo || ' '}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWide}>
            <Text style={styles.label}>Asesor Académico</Text>
            <Text style={styles.value}>{formData.alumno.asesorAcademico || ' '}</Text>
          </View>
        </View>
      </View>

      {/* Datos de la Empresa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Empresa:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{formData.empresa.nombre || ' '}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Asesor Empresarial</Text>
            <Text style={styles.value}>{formData.empresa.asesorEmpresarial || ' '}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWide}>
            <Text style={styles.label}>Puesto</Text>
            <Text style={styles.value}>{formData.empresa.puesto || ' '}</Text>
          </View>
        </View>
      </View>

      {/* Datos del Proyecto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos Proyecto:</Text>
        <View style={styles.row}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{formData.proyecto.nombre || ' '}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Objetivo</Text>
            <Text style={styles.value}>{formData.proyecto.objetivo || ' '}</Text>
          </View>
        </View>
      </View>

      {/* Tabla de Etapas */}
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Fases</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Duración</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Horas</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Descripción de competencia</Text>
            </View>
          </View>
          {formData.etapas.map((etapa, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{etapa.nombre}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {etapa.fechaInicio && etapa.fechaFin
                    ? `${etapa.fechaInicio} - ${etapa.fechaFin}`
                    : ' '}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{etapa.horas || ' '}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{etapa.competencia || ' '}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tabla de Información Adicional */}
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Actividades de Aprendizaje</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Resultados de Aprendizaje</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Evidencias</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Instrumentos de Evaluación</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.actividades || ' '}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.resultados || ' '}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.evidencias || ' '}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.instrumentos || ' '}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabla de 3 columnas para Asignaturas, Tópicos y Estrategias */}
      <View style={styles.tableContainer}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Asignaturas</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Tópicos Recomendados</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellHeader}>Estrategias Didácticas</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.asignaturas || ' '}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.topicos || ' '}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formData.estrategias || ' '}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sección de Firmas */}
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>FIRMAS DE AUTORIZACIÓN</Text>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>{formData.alumno.nombre || '_________________________'}</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>NOMBRE Y FIRMA DEL ESTUDIANTE</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>{formData.alumno.asesorAcademico || '_________________________'}</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>NOMBRE Y FIRMA DEL ASESOR ACADÉMICO</Text>
          </View>

          <View style={styles.signatureBox}>
            <Text style={styles.signatureName}>{formData.empresa.asesorEmpresarial || '_________________________'}</Text>
            <View style={styles.signatureLine}></View>
            <Text style={styles.signatureLabel}>NOMBRE Y FIRMA DEL ASESOR EMPRESARIAL</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

const DefinicionProyectoForm = () => {
  const [proyectoData, setProyectoData] = useState({
    proceso: 'Estancia I',
    fecha: new Date().toISOString().split('T')[0],
    lugar: 'Cancún, Quintana Roo',
    alumno: {
      nombre: '',
      grupo: '',
      asesorAcademico: ''
    },
    empresa: {
      nombre: '',
      asesorEmpresarial: '',
      puesto: ''
    },
    proyecto: {
      nombre: '',
      objetivo: ''
    },
    etapas: [
      {
        id: 1,
        nombre: '',
        fechaInicio: '',
        fechaFin: '',
        horas: '',
        competencia: ''
      }
    ],
    actividades: '',
    resultados: '',
    evidencias: '',
    instrumentos: '',
    asignaturas: '',
    topicos: '',
    estrategias: ''
  });

  const [expandedSections, setExpandedSections] = useState({});
  const [isPdfReady, setIsPdfReady] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProyectoChange = (section, field, value) => {
    setProyectoData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSimpleProyectoChange = (field, value) => {
    setProyectoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addEtapa = () => {
    if (proyectoData.etapas.length < 15) {
      setProyectoData(prev => ({
        ...prev,
        etapas: [...prev.etapas, {
          id: prev.etapas.length + 1,
          nombre: '',
          fechaInicio: '',
          fechaFin: '',
          horas: '',
          competencia: ''
        }]
      }));
    }
  };

  const removeEtapa = (id) => {
    if (proyectoData.etapas.length > 1) {
      setProyectoData(prev => ({
        ...prev,
        etapas: prev.etapas.filter(etapa => etapa.id !== id)
      }));
    }
  };

  const updateEtapa = (id, field, value) => {
    setProyectoData(prev => ({
      ...prev,
      etapas: prev.etapas.map(etapa =>
        etapa.id === id ? { ...etapa, [field]: value } : etapa
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPdfReady(true);
  };

  const procesos = ['Estancia I', 'Estancia II', 'Estadía'];

  return (
    <div className="proyecto-container">
      <div className="proyecto-header">
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
        <h1 className="proyecto-title">Universidad Politécnica de Quintana Roo</h1>
        <h2 className="proyecto-subtitle">Dirección de Vinculación, Difusión y Extensión Universitaria</h2>
        <h3 className="proyecto-form-title">Definición de Proyecto</h3>
      </div>

      <div className="proyecto-form-wrapper">
        <form onSubmit={handleSubmit} className="proyecto-form">
          <div className="proyecto-info-general">
            <div className="proyecto-info-grid">
              <div className="proyecto-field">
                <label>Tipo de Proceso</label>
                <select
                  value={proyectoData.proceso}
                  onChange={(e) => handleSimpleProyectoChange('proceso', e.target.value)}
                >
                  {procesos.map((proceso) => (
                    <option key={proceso} value={proceso}>{proceso}</option>
                  ))}
                </select>
              </div>
              <div className="proyecto-field">
                <label>Fecha de hoy</label>
                <input
                  type="date"
                  value={proyectoData.fecha}
                  onChange={(e) => handleSimpleProyectoChange('fecha', e.target.value)}
                />
              </div>
              <div className="proyecto-field proyecto-field-span-2">
                <label>Lugar donde se realizo el proceso</label>
                <input
                  type="text"
                  value={proyectoData.lugar}
                  onChange={(e) => handleSimpleProyectoChange('lugar', e.target.value)}
                  placeholder="Ejemplo: Cancún, Quintana Roo"
                />
              </div>
            </div>
          </div>

          <div className="proyecto-section">
            <div
              className="proyecto-section-header"
              onClick={() => toggleSection('alumnoProyecto')}
            >
              <h3 className="proyecto-section-title">
                <User className="section-icon" />
                Tus Datos
              </h3>
              {expandedSections.alumnoProyecto ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.alumnoProyecto !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <label>Tu nombre completo</label>
                    <input
                      type="text"
                      value={proyectoData.alumno.nombre}
                      onChange={(e) => handleProyectoChange('alumno', 'nombre', e.target.value)}
                      placeholder="Ejemplo: Juan Pérez García"
                    />
                  </div>
                  <div className="proyecto-field">
                    <Tooltip text="Tu grupo actual, ejemplo: 29AV, etc.">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Tu grupo <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.alumno.grupo}
                      onChange={(e) => handleProyectoChange('alumno', 'grupo', e.target.value)}
                      placeholder="Ejemplo: 21AM"
                    />
                  </div>
                  <div className="proyecto-field proyecto-field-span-2">
                    <Tooltip text="Es el maestro de la universidad que te va a supervisar durante tu estancia">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Asesor académico <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.alumno.asesorAcademico}
                      onChange={(e) => handleProyectoChange('alumno', 'asesorAcademico', e.target.value)}
                      placeholder="Ejemplo: Ing. María López"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="proyecto-section">
            <div
              className="proyecto-section-header"
              onClick={() => toggleSection('empresaProyecto')}
            >
              <h3 className="proyecto-section-title">
                <Building className="section-icon" />
                Datos de la Empresa
              </h3>
              {expandedSections.empresaProyecto ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.empresaProyecto !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <Tooltip text="El nombre oficial de la empresa donde harás tu estancia">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Nombre de la empresa <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.empresa.nombre}
                      onChange={(e) => handleProyectoChange('empresa', 'nombre', e.target.value)}
                      placeholder="Ejemplo: Hotel Xcaret, OXXO, Walmart"
                    />
                  </div>
                  <div className="proyecto-field">
                    <Tooltip text="La persona de la empresa que te va a supervisar y enseñar">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Asesor empresarial <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.empresa.asesorEmpresarial}
                      onChange={(e) => handleProyectoChange('empresa', 'asesorEmpresarial', e.target.value)}
                      placeholder="Ejemplo: Lic. Carlos Mendoza"
                    />
                  </div>
                  <div className="proyecto-field proyecto-field-span-2">
                    <Tooltip text="Puesto que ocupa tu asesor empresarial en la empresa ">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Puesto <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.empresa.puesto}
                      onChange={(e) => handleProyectoChange('empresa', 'puesto', e.target.value)}
                      placeholder="Ejemplo: Gerente de Operaciones, Especialista en Marketing Digital, Analista Financiero"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="proyecto-section">
            <div
              className="proyecto-section-header"
              onClick={() => toggleSection('proyectoInfo')}
            >
              <h3 className="proyecto-section-title">
                <Briefcase className="section-icon" />
                Tu Proyecto
              </h3>
              {expandedSections.proyectoInfo ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.proyectoInfo !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <Tooltip text="Un nombre corto que describa lo que vas a hacer">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Nombre de tu proyecto <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.proyecto.nombre}
                      onChange={(e) => handleProyectoChange('proyecto', 'nombre', e.target.value)}
                      placeholder="Ejemplo: Sistema de ventas para tienda, Campaña de redes sociales"
                    />
                  </div>
                  <div className="proyecto-field">
                    <Tooltip text="Explica para qué sirve tu proyecto, qué problema resuelve">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Para qué sirve tu proyecto <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <textarea
                      value={proyectoData.proyecto.objetivo}
                      onChange={(e) => handleProyectoChange('proyecto', 'objetivo', e.target.value)}
                      rows={3}
                      style={{ resize: 'none', overflowY: 'auto', height: '100px', width: '100%', wordWrap: 'break-word' }}
                      placeholder="Ejemplo: Crear una página web para que los clientes puedan ver los productos y hacer pedidos más fácil, lo que ayudará a la empresa a vender más..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="proyecto-section">
            <div className="proyecto-section-header proyecto-header-with-action">
              <h3 className="proyecto-section-title">
                <Calendar className="section-icon" />
                Fases de tu Proyecto
              </h3>
              <button
                type="button"
                onClick={addEtapa}
                className="proyecto-add-btn"
              >
                <Plus className="btn-icon-small" />
                Agregar Fase
              </button>
            </div>
            <div className="proyecto-section-content">
              <div className="proyecto-etapas-container">
                {proyectoData.etapas.map((etapa) => (
                  <div key={etapa.id} className="proyecto-etapa">
                    <div className="proyecto-etapa-header">
                      <h4 className="proyecto-etapa-title">Fase {etapa.id}</h4>
                      {proyectoData.etapas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEtapa(etapa.id)}
                          className="proyecto-remove-btn"
                        >
                          <Trash2 className="btn-icon-small" />
                        </button>
                      )}
                    </div>
                    <div className="proyecto-grid">
                      <div className="proyecto-field">
                        <Tooltip text="Un nombre que describa esta parte del proyecto">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Nombre de esta fase <HelpCircle size={16} color="#666" />
                          </label>
                        </Tooltip>
                        <input
                          type="text"
                          value={etapa.nombre}
                          onChange={(e) => updateEtapa(etapa.id, 'nombre', e.target.value)}
                          placeholder="Ejemplo: Investigación inicial, Diseño, Implementación"
                        />
                      </div>
                      <div className="proyecto-field">
                        <label>Cuándo empiezas</label>
                        <input
                          type="date"
                          value={etapa.fechaInicio}
                          onChange={(e) => updateEtapa(etapa.id, 'fechaInicio', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field">
                        <label>Cuándo terminas</label>
                        <input
                          type="date"
                          value={etapa.fechaFin}
                          onChange={(e) => updateEtapa(etapa.id, 'fechaFin', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field">
                        <Tooltip text="Cuántas horas de trabajo necesitas para esta fase">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Horas de trabajo <HelpCircle size={16} color="#666" />
                          </label>
                        </Tooltip>
                        <input
                          type="number"
                          value={etapa.horas}
                          onChange={(e) => updateEtapa(etapa.id, 'horas', e.target.value)}
                          placeholder="Ejemplo: 40"
                        />
                      </div>
                      <div className="proyecto-field proyecto-field-span-4">
                        <Tooltip text="Describe qué actividades específicas vas a hacer en esta fase">
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            Actividades de esta fase <HelpCircle size={16} color="#666" />
                          </label>
                        </Tooltip>
                        <textarea
                          value={etapa.competencia}
                          onChange={(e) => updateEtapa(etapa.id, 'competencia', e.target.value)}
                          rows={2}
                          style={{ resize: 'none', overflowY: 'auto', height: '80px', width: '100%', wordWrap: 'break-word' }}
                          placeholder="Ejemplo: Investigar qué necesita la empresa, entrevistar clientes, revisar procesos actuales..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="proyecto-section">
            <div
              className="proyecto-section-header"
              onClick={() => toggleSection('infoAdicional')}
            >
              <h3 className="proyecto-section-title">Información Adicional</h3>
              {expandedSections.infoAdicional ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.infoAdicional !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <label>Actividades de Aprendizaje</label>
                    <textarea
                      value={proyectoData.actividades}
                      onChange={(e) => handleSimpleProyectoChange('actividades', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '100px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Resultados de Aprendizaje</label>
                    <textarea
                      value={proyectoData.resultados}
                      onChange={(e) => handleSimpleProyectoChange('resultados', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '100px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Evidencias</label>
                    <textarea
                      value={proyectoData.evidencias}
                      onChange={(e) => handleSimpleProyectoChange('evidencias', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '100px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Instrumentos de Evaluación</label>
                    <textarea
                      value={proyectoData.instrumentos}
                      onChange={(e) => handleSimpleProyectoChange('instrumentos', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '100px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Asignaturas</label>
                    <textarea
                      value={proyectoData.asignaturas}
                      onChange={(e) => handleSimpleProyectoChange('asignaturas', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '150px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Tópicos Recomendados</label>
                    <textarea
                      value={proyectoData.topicos}
                      onChange={(e) => handleSimpleProyectoChange('topicos', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '150px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Estrategias Didácticas</label>
                    <textarea
                      value={proyectoData.estrategias}
                      onChange={(e) => handleSimpleProyectoChange('estrategias', e.target.value)}
                      rows={4}
                      style={{ resize: 'none', overflowY: 'auto', height: '150px', width: '100%', wordWrap: 'break-word' }}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="proyecto-submit-wrapper">
            <button type="submit" className="proyecto-submit-btn">
              <Send className="btn-icon" />
              Preparar PDF
            </button>

            {isPdfReady && (
              <PDFDownloadLink
                document={<DefinicionProyectoPDF formData={proyectoData} />}
                fileName="definicion_proyecto.pdf"
                className="proyecto-download-btn"
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

export default DefinicionProyectoForm;