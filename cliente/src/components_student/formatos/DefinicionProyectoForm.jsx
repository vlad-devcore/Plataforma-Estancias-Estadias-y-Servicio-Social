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
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#7A2A05',
    color: 'white',
    padding: 3,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  field: {
    flex: 1,
    marginRight: 10,
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
    marginTop: 10,
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
    width: '25%',
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
    marginBottom: 10,
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
        <Text style={{fontSize: 10}}>Proceso: {formData.proceso}</Text>
        <Text style={{fontSize: 10}}>Fecha y lugar: {formData.lugar} a {formData.fecha}</Text>
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
          <View style={styles.fieldWide}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{formData.proyecto.nombre || ' '}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.fieldWide}>
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
              <Text style={styles.tableCellHeader}>Nombre de competencia</Text>
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

      {/* Información Adicional */}
      <View style={{marginTop: 20}}>
        {formData.actividades && (
          <View style={styles.section}>
            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>Actividades de Aprendizaje:</Text>
            <Text style={styles.textArea}>{formData.actividades}</Text>
          </View>
        )}
        
        {formData.resultados && (
          <View style={styles.section}>
            <Text style={{fontSize: 10, fontWeight: 'bold', marginBottom: 5}}>Resultados de Aprendizaje:</Text>
            <Text style={styles.textArea}>{formData.resultados}</Text>
          </View>
        )}
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

  const camposAdicionales = [
    { 
      key: 'actividades', 
      label: 'Cosas que vas a aprender', 
      placeholder: 'Ejemplo: Aprender a usar Excel para hacer reportes de ventas, participar en reuniones con clientes, ayudar en el diseño de páginas web...',
      showTip: false
    },
    { 
      key: 'resultados', 
      label: 'Lo que vas a lograr', 
      placeholder: 'Ejemplo: Al final sabré crear reportes financieros, podré atender clientes por teléfono, habré terminado el diseño de 3 páginas web...',
      showTip: false
    },
    { 
      key: 'evidencias', 
      label: 'Pruebas de tu trabajo', 
      placeholder: 'Ejemplo: Fotos de los proyectos terminados, capturas de pantalla de sistemas que usé, documentos que creé...',
      showTip: false
    },
    { 
      key: 'instrumentos', 
      label: 'Cómo te van a evaluar', 
      placeholder: 'Ejemplo: Lista de verificación, rúbrica de evaluación, examen práctico, presentación final...',
      showTip: false
    },
    { 
      key: 'asignaturas', 
      label: 'Materias relacionadas', 
      placeholder: 'Ejemplo: Contabilidad, Marketing Digital, Programación Web, Administración...',
      showTip: false
    },
    { 
      key: 'topicos', 
      label: 'Temas importantes', 
      placeholder: 'Ejemplo: Servicio al cliente, manejo de redes sociales, uso de software contable...',
      showTip: false
    },
    { 
      key: 'estrategias', 
      label: 'Cómo vas a aprender', 
      placeholder: 'Ejemplo: Observando a mi supervisor, practicando con casos reales, recibiendo capacitación...',
      showTip: false
    }
  ];

  return (
    <div className="proyecto-container">
      <div className="proyecto-header">
        
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

        {/* Títulos */}
        <h1 className="proyecto-title">Universidad Politécnica de Quintana Roo</h1>
        <h2 className="proyecto-subtitle">Dirección de Vinculación, Difusión y Extensión Universitaria</h2>
        <h3 className="proyecto-form-title">Definición de Proyecto</h3>
      </div>

      <div className="proyecto-form-wrapper">
        <form onSubmit={handleSubmit} className="proyecto-form">
          {/* Información General */}
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
                <label>Ciudad donde estás</label>
                <input
                  type="text"
                  value={proyectoData.lugar}
                  onChange={(e) => handleSimpleProyectoChange('lugar', e.target.value)}
                  placeholder="Ejemplo: Cancún, Quintana Roo"
                />
              </div>
            </div>
          </div>

          {/* Datos del Alumno */}
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
                    <Tooltip text="Tu grupo actual, ejemplo: 9A, 7B, etc.">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Tu grupo <HelpCircle size={16} color="#666" />
                      </label>
                    </Tooltip>
                    <input
                      type="text"
                      value={proyectoData.alumno.grupo}
                      onChange={(e) => handleProyectoChange('alumno', 'grupo', e.target.value)}
                      placeholder="Ejemplo: 9A"
                    />
                  </div>
                  <div className="proyecto-field proyecto-field-span-2">
                    <Tooltip text="Es el maestro de la universidad que te va a supervisar durante tu estancia">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        Profesor que te supervisa <HelpCircle size={16} color="#666" />
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

          {/* Datos de la Empresa */}
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
                        Tu supervisor en la empresa <HelpCircle size={16} color="#666" />
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

          {/* Datos del Proyecto */}
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
                    placeholder="Ejemplo: Crear una página web para que los clientes puedan ver los productos y hacer pedidos más fácil, lo que ayudará a la empresa a vender más..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Etapas del Proyecto */}
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
                          placeholder="Ejemplo: Investigar qué necesita la empresa, entrevistar clientes, revisar procesos actuales..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          {camposAdicionales.map((campo) => (
            <div key={campo.key} className="proyecto-section">
              <div 
                className="proyecto-section-header"
                onClick={() => toggleSection(campo.key)}
              >
                <h3 className="proyecto-section-title">
                  {campo.label}
                </h3>
                {expandedSections[campo.key] ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections[campo.key] !== false && (
                <div className="proyecto-section-content">
                  <textarea
                    value={proyectoData[campo.key]}
                    onChange={(e) => handleSimpleProyectoChange(campo.key, e.target.value)}
                    rows={4}
                    className="proyecto-textarea"
                    placeholder={campo.placeholder}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Submit Button */}
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