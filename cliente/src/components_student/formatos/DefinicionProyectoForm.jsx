import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, User, Building, Briefcase, Calendar, Send } from 'lucide-react';
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
  }
});

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
    { key: 'actividades', label: 'Actividades de Aprendizaje' },
    { key: 'resultados', label: 'Resultados de Aprendizaje' },
    { key: 'evidencias', label: 'Evidencias' },
    { key: 'instrumentos', label: 'Instrumentos de Evaluación' },
    { key: 'asignaturas', label: 'Asignaturas' },
    { key: 'topicos', label: 'Tópicos Recomendados' },
    { key: 'estrategias', label: 'Estrategias Didácticas' }
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
                <label>Proceso</label>
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
                <label>Fecha</label>
                <input
                  type="date"
                  value={proyectoData.fecha}
                  onChange={(e) => handleSimpleProyectoChange('fecha', e.target.value)}
                />
              </div>
              <div className="proyecto-field proyecto-field-span-2">
                <label>Lugar</label>
                <input
                  type="text"
                  value={proyectoData.lugar}
                  onChange={(e) => handleSimpleProyectoChange('lugar', e.target.value)}
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
                Alumno
              </h3>
              {expandedSections.alumnoProyecto ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.alumnoProyecto !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <label>Nombre del Alumno</label>
                    <input
                      type="text"
                      value={proyectoData.alumno.nombre}
                      onChange={(e) => handleProyectoChange('alumno', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Grupo</label>
                    <input
                      type="text"
                      value={proyectoData.alumno.grupo}
                      onChange={(e) => handleProyectoChange('alumno', 'grupo', e.target.value)}
                    />
                  </div>
                  <div className="proyecto-field proyecto-field-span-2">
                    <label>Asesor Académico</label>
                    <input
                      type="text"
                      value={proyectoData.alumno.asesorAcademico}
                      onChange={(e) => handleProyectoChange('alumno', 'asesorAcademico', e.target.value)}
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
                Empresa
              </h3>
              {expandedSections.empresaProyecto ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.empresaProyecto !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-grid">
                  <div className="proyecto-field">
                    <label>Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={proyectoData.empresa.nombre}
                      onChange={(e) => handleProyectoChange('empresa', 'nombre', e.target.value)}
                    />
                  </div>
                  <div className="proyecto-field">
                    <label>Asesor Empresarial</label>
                    <input
                      type="text"
                      value={proyectoData.empresa.asesorEmpresarial}
                      onChange={(e) => handleProyectoChange('empresa', 'asesorEmpresarial', e.target.value)}
                    />
                  </div>
                  <div className="proyecto-field proyecto-field-span-2">
                    <label>Puesto</label>
                    <input
                      type="text"
                      value={proyectoData.empresa.puesto}
                      onChange={(e) => handleProyectoChange('empresa', 'puesto', e.target.value)}
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
                Proyecto
              </h3>
              {expandedSections.proyectoInfo ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSections.proyectoInfo !== false && (
              <div className="proyecto-section-content">
                <div className="proyecto-field">
                  <label>Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={proyectoData.proyecto.nombre}
                    onChange={(e) => handleProyectoChange('proyecto', 'nombre', e.target.value)}
                  />
                </div>
                <div className="proyecto-field">
                  <label>Objetivo del Proyecto</label>
                  <textarea
                    value={proyectoData.proyecto.objetivo}
                    onChange={(e) => handleProyectoChange('proyecto', 'objetivo', e.target.value)}
                    rows={3}
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
                Etapas del Proyecto
              </h3>
              <button
                type="button"
                onClick={addEtapa}
                className="proyecto-add-btn"
              >
                <Plus className="btn-icon-small" />
                Agregar Etapa
              </button>
            </div>
            <div className="proyecto-section-content">
              <div className="proyecto-etapas-container">
                {proyectoData.etapas.map((etapa) => (
                  <div key={etapa.id} className="proyecto-etapa">
                    <div className="proyecto-etapa-header">
                      <h4 className="proyecto-etapa-title">Etapa {etapa.id}</h4>
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
                        <label>Nombre de la Etapa</label>
                        <input
                          type="text"
                          value={etapa.nombre}
                          onChange={(e) => updateEtapa(etapa.id, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field">
                        <label>Fecha de Inicio</label>
                        <input
                          type="date"
                          value={etapa.fechaInicio}
                          onChange={(e) => updateEtapa(etapa.id, 'fechaInicio', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field">
                        <label>Fecha de Fin</label>
                        <input
                          type="date"
                          value={etapa.fechaFin}
                          onChange={(e) => updateEtapa(etapa.id, 'fechaFin', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field">
                        <label>Horas</label>
                        <input
                          type="number"
                          value={etapa.horas}
                          onChange={(e) => updateEtapa(etapa.id, 'horas', e.target.value)}
                        />
                      </div>
                      <div className="proyecto-field proyecto-field-span-4">
                        <label>Competencia</label>
                        <textarea
                          value={etapa.competencia}
                          onChange={(e) => updateEtapa(etapa.id, 'competencia', e.target.value)}
                          rows={2}
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
                <h3 className="proyecto-section-title">{campo.label}</h3>
                {expandedSections[campo.key] ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections[campo.key] !== false && (
                <div className="proyecto-section-content">
                  <textarea
                    value={proyectoData[campo.key]}
                    onChange={(e) => handleSimpleProyectoChange(campo.key, e.target.value)}
                    rows={4}
                    className="proyecto-textarea"
                    placeholder={`Ingrese ${campo.label.toLowerCase()}...`}
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