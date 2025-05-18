import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CreditsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('equipo');

  // Cerrar el modal con la tecla Escape
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  // Datos del equipo
  const teamMembers = [
    {
      name: 'Alberto Castrejón',
      role: 'Desarrollador Frontend',
      emoji: '👨🏻‍💻',
      image: '/team/alberto.jpg',
      github: 'https://github.com/AlbertoCastre',
      linkedin: 'https://www.linkedin.com/in/alberto-castrejon-1b061a291/'
    },
    {
      name: 'Juan Och',
      role: 'Desarrollador Backend',
      emoji: '👨🏾‍💻',
      image: '/team/juan.jpg',
      github: 'https://github.com/juanoch',
      linkedin: 'https://linkedin.com/in/juanoch'
    },
    {
      name: 'Vladimir Poot',
      role: 'Diseñador UI/UX',
      emoji: '🎨',
      image: '/team/vladimir.jpg',
      github: 'https://github.com/vladimirpoot',
      linkedin: 'https://linkedin.com/in/vladimirpoot'
    },
    {
      name: 'Zurisaday Guerrero',
      role: 'Diseñador UI/UX',
      emoji: '🎨',
      image: '/team/zurisaday.jpg',
      github: 'https://github.com/zury-guerrero',
      linkedin: 'https://www.linkedin.com/in/zurisaday-guerrero-a21104291/'
    },
    {
      name: 'Yeriel Cupido',
      role: 'Tester QA',
      emoji: '🛠️',
      image: '/team/yeriel.jpg',
      github: 'https://github.com/yerielcupido',
      linkedin: 'https://linkedin.com/in/yerielcupido'
    }
  ];

  // SVG Icons
  const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );

  const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
    </svg>
  );

  const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
    </svg>
  );

  // Renderizar tarjeta de miembro del equipo
  const TeamMemberCard = ({ member }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center p-3 bg-orange-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 flex-shrink-0 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
        {member.emoji}
      </div>
      <div className="ml-3 flex-grow">
        <h3 className="font-medium text-gray-800">{member.name}</h3>
        <p className="text-sm text-gray-600">{member.role}</p>
      </div>
      <div className="flex space-x-2">
        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
          <GithubIcon />
        </a>
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
          <LinkedinIcon />
        </a>
      </div>
    </motion.div>
  );

  return (
    <>
      {/* Botón flotante de créditos */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleModal}
        className="fixed bottom-4 right-4 p-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg z-50 flex items-center justify-center"
        aria-label="Ver créditos"
      >
        <InfoIcon />
      </motion.button>

      {/* Modal con AnimatePresence para animaciones de entrada/salida */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={toggleModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-xl max-w-lg w-full mx-4 relative shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Logo centrado en la parte superior */}
              <div className="bg-gray-50 p-5 flex justify-center border-b">
                <img
                  src="/logoUNI.png"
                  alt="UPQROO Logo"
                  className="h-16 w-auto"
                />
              </div>
              
              {/* Header con gradiente */}
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-4 text-white relative">
                <button
                  onClick={toggleModal}
                  className="absolute top-3 right-3 text-white hover:text-orange-100 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <CloseIcon />
                </button>
                
                <div className="flex items-center justify-center w-full">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Créditos</h2>
                    <p className="text-white text-sm">Universidad Politécnica de Quintana Roo</p>
                  </div>
                </div>
              </div>
              
              {/* Tabs de navegación */}
              <div className="flex border-b">
                <button 
                  onClick={() => setActiveTab('equipo')}
                  className={`flex-1 py-3 font-medium ${activeTab === 'equipo' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Equipo
                </button>
                <button 
                  onClick={() => setActiveTab('proyecto')}
                  className={`flex-1 py-3 font-medium ${activeTab === 'proyecto' ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Proyecto
                </button>
               

                
              </div>
              
              {/* Contenido basado en la pestaña activa */}
              <div className="p-5 max-h-96 overflow-y-auto">
                {activeTab === 'equipo' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="team"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <p className="text-gray-700 mb-4 text-center">
                        Desarrollado con dedicación por talento de la UPQROO
                      </p>
                      
                      {teamMembers.map((member, index) => (
                        <TeamMemberCard key={index} member={member} />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
                
                {activeTab === 'proyecto' && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="project"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-lg text-gray-800">Acerca del proyecto</h3>
                      <p className="text-gray-700">
                        Este proyecto fue desarrollado como parte del programa educativo de la Universidad 
                        Politécnica de Quintana Roo, con el objetivo de crear una plataforma integral para la gestión 
                        académica y administrativa.
                      </p>
                      
                      <h4 className="font-semibold text-gray-800 mt-3">Objetivos</h4>
                      <ul className="list-disc pl-5 text-gray-700 space-y-1">
                        <li>Facilitar la gestión de información académica</li>
                        <li>Mejorar la comunicación entre estudiantes y profesores</li>
                        <li>Optimizar procesos administrativos</li>
                        <li>Implementar tecnologías modernas y escalables</li>
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                )}
                
               
              </div>
              
              {/* Footer */}
              <div className="border-t p-4 text-center text-sm text-gray-500 bg-gray-50">
                © 2025 UPQROO. Todos los derechos reservados.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreditsModal;