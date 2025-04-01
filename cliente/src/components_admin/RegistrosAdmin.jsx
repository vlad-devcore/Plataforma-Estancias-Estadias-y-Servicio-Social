import React from 'react';

const App = () => {
  // Datos falsos para poblar la tabla
  const data = [
    { matricula: '20210001', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Completada' },
    { matricula: '20210002', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Pendiente' },
    { matricula: '20210003', proceso: 'Evaluación', periodo: '2022-1', documentacion: 'Completada' },
    { matricula: '20210004', proceso: 'Inscripción', periodo: '2021-2', documentacion: 'Completada' },
    { matricula: '20210005', proceso: 'Evaluación', periodo: '2022-1', documentacion: 'Pendiente' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center mb-6">Trayectoria del alumno</h1>
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-t-lg">
            <div>Matrícula</div>
            <div>Proceso</div>
            <div>Periodo</div>
            <div>Documentación</div>
          </div>
          {data.length > 0 ? (
            <div>
              {data.map((item, index) => (
                <div key={index} className="grid grid-cols-4 p-4 border-b">
                  <div>{item.matricula}</div>
                  <div>{item.proceso}</div>
                  <div>{item.periodo}</div>
                  <div>{item.documentacion}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No data available in table
            </div>
          )}
          <div className="flex justify-between p-4 border-t">
            <div>Showing 1 to 5 of 5 entries</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-gray-100 rounded" disabled>
                Previous
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;