import { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

function AnimalCatalogo() {
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [especies, setEspecies] = useState([]);
  const [recintos, setRecintos] = useState([]);
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroRecinto, setFiltroRecinto] = useState('');

  const [animalSeleccionado, setAnimalSeleccionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState(null);

  const [nuevoComentario, setNuevoComentario] = useState('');
  const [nuevoAutor, setNuevoAutor] = useState('');
  const [nuevaCalificacion, setNuevaCalificacion] = useState('5');
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/especies`).then((res) => res.json()),
      fetch(`${API_URL}/recintos`).then((res) => res.json())
    ])
      .then(([especiesData, recintosData]) => {
        setEspecies(especiesData || []);
        setRecintos(recintosData || []);
      })
      .catch(() => {
        setError('No se pudieron cargar los filtros');
      });
  }, []);

  useEffect(() => {
    const cargarAnimales = async () => {
      try {
        setCargando(true);
        let url = `${API_URL}/animals`;
        const params = new URLSearchParams();
        if (filtroEspecie) params.append('especieId', filtroEspecie);
        if (filtroRecinto) params.append('recintoId', filtroRecinto);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        setAnimales(Array.isArray(data) ? data : []);
        setCargando(false);
      } catch (err) {
        console.error('Error:', err);
        setError('No se pudieron cargar los animales');
        setAnimales([]);
        setCargando(false);
      }
    };
    cargarAnimales();
  }, [filtroEspecie, filtroRecinto]);

  useEffect(() => {
    if (!animalSeleccionado) {
      setComentarios([]);
      return;
    }
    const cargarComentarios = async () => {
      try {
        setCargandoComentarios(true);
        const res = await fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`);
        const data = await res.json();
        setComentarios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error:', err);
        setErrorComentarios('No se pudieron cargar los comentarios');
        setComentarios([]);
      } finally {
        setCargandoComentarios(false);
      }
    };
    cargarComentarios();
  }, [animalSeleccionado]);

  const handleEnviarComentario = async (e) => {
    e.preventDefault();
    setErrorFormulario(null);
    setEnviandoComentario(true);
    try {
      const res = await fetch(`${API_URL}/animals/${animalSeleccionado.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autor: nuevoAutor.trim(),
          calificacion: parseInt(nuevaCalificacion),
          comentario: nuevoComentario.trim()
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors && Array.isArray(errorData.errors)) {
          setErrorFormulario(errorData.errors.map((e) => e.message).join(', '));
        } else {
          setErrorFormulario(errorData.message || 'Error al crear comentario');
        }
      } else {
        const nuevoComentarioData = await res.json();
        setComentarios([...comentarios, nuevoComentarioData]);
        setNuevoComentario('');
        setNuevoAutor('');
        setNuevaCalificacion('5');
      }
    } catch (err) {
      console.error('Error:', err);
      setErrorFormulario('Error de conexión');
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🐾 Catálogo de Animales</h2>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label>Filtrar por Especie:</label>
          <select
            value={filtroEspecie}
            onChange={(e) => {
              setFiltroEspecie(e.target.value);
              setAnimalSeleccionado(null);
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
              setAnimalSeleccionado(null);
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

      {cargando ? (
        <p>Cargando animales...</p>
      ) : animales.length === 0 ? (
        <p>No hay animales disponibles.</p>
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
                    backgroundColor: animalSeleccionado?.id === animal.id ? '#e0f0ff' : '#f5f5f5',
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

          {animalSeleccionado && (
            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', maxHeight: '700px', overflowY: 'auto' }}>
              <h3>Detalle: {animalSeleccionado.nombre}</h3>
              <p><strong>Especie:</strong> {animalSeleccionado.especie?.nombre || 'N/A'}</p>
              <p><strong>Recinto:</strong> {animalSeleccionado.recinto?.nombre || 'N/A'}</p>
              <p><strong>Edad:</strong> {animalSeleccionado.edad} años</p>
              <p><strong>Peso:</strong> {animalSeleccionado.peso || 'N/A'} kg</p>
              <p><strong>Estado:</strong> {animalSeleccionado.disponible ? '✅ Disponible' : '❌ No disponible'}</p>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
                <h4>Comentarios ({comentarios.length})</h4>
                {errorComentarios && <p style={{ color: 'orange' }}>⚠️ {errorComentarios}</p>}
                {cargandoComentarios ? (
                  <p>Cargando comentarios...</p>
                ) : comentarios.length === 0 ? (
                  <p style={{ color: '#666' }}>Sin comentarios aún.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {comentarios.map((comentario) => (
                      <li key={comentario.id} style={{ padding: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f9f9f9', borderLeft: '3px solid #0066cc', paddingLeft: '0.75rem' }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontStyle: 'italic', color: '#666' }}>
                          <strong>{comentario.autor}</strong> - ⭐ {comentario.calificacion}/5
                        </p>
                        <p style={{ margin: 0 }}>{comentario.comentario}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={handleEnviarComentario} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <label><strong>Nombre:</strong></label>
                    <input
                      type="text"
                      value={nuevoAutor}
                      onChange={(e) => setNuevoAutor(e.target.value)}
                      placeholder="Tu nombre..."
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      disabled={enviandoComentario}
                    />
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label><strong>Calificación:</strong></label>
                    <select value={nuevaCalificacion} onChange={(e) => setNuevaCalificacion(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }} disabled={enviandoComentario}>
                      <option value="1">⭐ 1 - Muy malo</option>
                      <option value="2">⭐⭐ 2 - Malo</option>
                      <option value="3">⭐⭐⭐ 3 - Regular</option>
                      <option value="4">⭐⭐⭐⭐ 4 - Bueno</option>
                      <option value="5">⭐⭐⭐⭐⭐ 5 - Excelente</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.5rem' }}>
                    <label><strong>Comentario:</strong></label>
                    <textarea
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      placeholder="Mínimo 10 caracteres..."
                      rows="3"
                      style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      disabled={enviandoComentario}
                    />
                  </div>

                  {errorFormulario && <p style={{ color: 'red', fontSize: '0.9rem' }}>❌ {errorFormulario}</p>}

                  <button
                    type="submit"
                    disabled={enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim()}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim() ? '#ccc' : '#0066cc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: enviandoComentario || !nuevoComentario.trim() || !nuevoAutor.trim() ? 'not-allowed' : 'pointer'
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
