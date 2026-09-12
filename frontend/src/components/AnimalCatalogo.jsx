import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  // Estados para el listado de animales
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroRecinto, setFiltroRecinto] = useState('');

  // Estados para el detalle y comentarios del animal
  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  // Estado para el formulario de comentario
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevoAutor, setNuevoAutor] = useState('');
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorComentario, setErrorComentario] = useState(null);

  // Cargar especies y recintos para los filtros
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/especies`).then((res) => res.json()),
      fetch(`${API_URL}/recintos`).then((res) => res.json())
    ])
      .then(([especiesData, recintosData]) => {
        setEspecies(especiesData);
        setRecintos(recintosData);
      })
      .catch(() => {
        setError('No se pudieron cargar los filtros');
      });
  }, []);

  // Cargar animales según los filtros
  useEffect(() => {
    setCargando(true);
    let url = `${API_URL}/animals`;

    // Construir query params si hay filtros activos
    const params = new URLSearchParams();
    if (filtroEspecie) params.append('especieId', filtroEspecie);
    if (filtroRecinto) params.append('recintoId', filtroRecinto);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAnimales(data);
        setCargando(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los animales');
        setCargando(false);
      });
  }, [filtroEspecie, filtroRecinto]); // Se ejecuta cuando cambian los filtros

  // Cargar comentarios cuando se selecciona un animal
  useEffect(() => {
    if (!animalSeleccionado) return;

    setCargandoComentarios(true);
    fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComentarios(data);
        setCargandoComentarios(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los comentarios');
        setCargandoComentarios(false);
      });
  }, [animalSeleccionado]);

  // Manejar envío de comentario
  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    setErrorComentario(null);
    setEnviandoComentario(true);

    try {
      const res = await fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          autor: nuevoAutor,
          calificacion: parseInt(nuevaCalificacion),
          comentario: nuevoComentario
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Mostrar errores de validación de Zod
        if (res.status === 400 && errorData.errors) {
          setErrorComentario(errorData.errors.map((e) => e.message).join(', '));
        } else {
          setErrorComentario(errorData.message || 'Error al crear comentario');
        }
      } else {
        const nuevoComentarioData = await res.json();
        setComentarios([...comentarios, nuevoComentarioData]);
        setNuevoComentario('');
        setNuevoAutor('');
        setNuevaCalificacion(5);
      }
    } catch (err) {
      setErrorComentario('Error de conexión');
    } finally {
      setEnviandoComentario(false);
    }
  };

  if (error && !animalSeleccionado) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🐾 Catálogo de Animales</h2>

      {/* Filtros */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Filtrar por Especie:</label>
          <select
            value={filtroEspecie}
            onChange={(e) => {
              setFiltroEspecie(e.target.value);
              setAnimalSeleccionado(null); // Limpiar selección al cambiar filtro
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">Todas</option>
            {especies.map((especie) => (
              <option key={especie.id} value={especie.id}>
                {especie.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Filtrar por Recinto:</label>
          <select
            value={filtroRecinto}
            onChange={(e) => {
              setFiltroRecinto(e.target.value);
              setAnimalSeleccionado(null); // Limpiar selección al cambiar filtro
            }}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="">Todos</option>
            {recintos.map((recinto) => (
              <option key={recinto.id} value={recinto.id}>
                {recinto.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Listado de animales */}
      {cargando ? (
        <p>Cargando animales...</p>
      ) : animales.length === 0 ? (
        <p>No hay animales disponibles con los filtros seleccionados.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3>Animales ({animales.length})</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {animales.map((animal) => (
                <li
                  key={animal.id}
                  onClick={() => setAnimalSeleccionado(animal)}
                  style={{
                    padding: '0.5rem',
                    margin: '0.25rem 0',
                    backgroundColor:
                      animalSeleccionado?.id === animal.id ? '#e0f0ff' : '#f5f5f5',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    border: animalSeleccionado?.id === animal.id ? '2px solid #0066cc' : '1px solid #ddd'
                  }}
                >
                  <strong>{animal.nombre}</strong> ({animal.especie?.nombre || 'N/A'})
                </li>
              ))}
            </ul>
          </div>

          {/* Detalle y comentarios del animal seleccionado */}
          {animalSeleccionado && (
            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
              <h3>Detalle: {animalSeleccionado.nombre}</h3>
              <p>
                <strong>Especie:</strong> {animalSeleccionado.especie?.nombre || 'N/A'}
              </p>
              <p>
                <strong>Recinto:</strong> {animalSeleccionado.recinto?.nombre || 'N/A'}
              </p>
              <p>
                <strong>Edad:</strong> {animalSeleccionado.edad || 'N/A'} años
              </p>
              <p>
                <strong>Estado:</strong> {animalSeleccionado.disponible ? '✅ Disponible' : '❌ No disponible'}
              </p>

              {/* Comentarios */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                <h4>Comentarios ({comentarios.length})</h4>

                {cargandoComentarios ? (
                  <p>Cargando comentarios...</p>
                ) : comentarios.length === 0 ? (
                  <p style={{ color: '#666' }}>Sin comentarios aún.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {comentarios.map((comentario) => (
                      <li
                        key={comentario.id}
                        style={{
                          padding: '0.5rem',
                          marginBottom: '0.5rem',
                          backgroundColor: '#f9f9f9',
                          borderLeft: '3px solid #0066cc',
                          paddingLeft: '0.75rem'
                        }}
                      >
                        <p style={{ margin: '0 0 0.25rem 0', fontStyle: 'italic', color: '#666' }}>
                          <strong>{comentario.autor}</strong> - ⭐ {comentario.calificacion}/5
                        </p>
                        <p style={{ margin: 0 }}>{comentario.comentario}</p>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Formulario para nuevo comentario */}
                <form
                  onSubmit={handleEnviarComentario}
                  style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor="autor-input">
                      <strong>Nombre (autor):</strong>
                    </label>
                    <input
                      id="autor-input"
                      type="text"
                      value={nuevoAutor}
                      onChange={(e) => {
                        setNuevoAutor(e.target.value);
                        setErrorComentario(null);
                      }}
                      placeholder="Tu nombre..."
                      style={{
                        width: '100%',
                        marginTop: '0.25rem',
                        padding: '0.5rem',
                        fontFamily: 'sans-serif',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                      disabled={enviandoComentario}
                    />
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor="calificacion-input">
                      <strong>Calificación:</strong>
                    </label>
                    <select
                      id="calificacion-input"
                      value={nuevaCalificacion}
                      onChange={(e) => {
                        setNuevaCalificacion(e.target.value);
                        setErrorComentario(null);
                      }}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                      disabled={enviandoComentario}
                    >
                      <option value="1">⭐ 1 - Muy malo</option>
                      <option value="2">⭐⭐ 2 - Malo</option>
                      <option value="3">⭐⭐⭐ 3 - Regular</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Bueno</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Excelente</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor="comentario-input">
                      <strong>Comentario:</strong>
                    </label>
                    <textarea
                      id="comentario-input"
                      value={nuevoComentario}
                      onChange={(e) => {
                        setNuevoComentario(e.target.value);
                        setErrorComentario(null);
                      }}
                      placeholder="Escribe tu comentario (mínimo 10 caracteres)..."
                      rows="3"
                      style={{
                        width: '100%',
                        marginTop: '0.25rem',
                        padding: '0.5rem',
                        fontFamily: 'sans-serif',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box'
                      }}
                      disabled={enviandoComentario}
                    />
                  </div>

                  {errorComentario && (
                    <p style={{ color: 'red', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                      ❌ {errorComentario}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim()}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor:
                        enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim()
                          ? '#ccc'
                          : '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor:
                        enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim()
                          ? 'not-allowed'
                          : 'pointer'
                    }}
                  >
                    {enviandoComentario ? 'Enviando...' : 'Enviar Comentario'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AnimalCatalogo;
