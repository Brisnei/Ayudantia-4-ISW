// Componente principal - Especies y Recintos ya están resueltos como referencia.
// Debajo va el espacio para el catálogo de Animales - ESO es tu actividad.
import EspecieList from './components/EspecieList';
import RecintoList from './components/RecintoList';
// import AnimalCatalogo from './components/AnimalCatalogo'; // lo crearás tú

function App() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🦁 ZooAPI</h1>

      <EspecieList />
      <RecintoList />

      {/* 
        actividad: crear el componente AnimalCatalogo con:
        - Listado de animales (GET /api/animals), mismo patrón que arriba
        - Filtro por especie o recinto (<select> + useEffect con dependencia)
        - Al hacer clic en un animal: ver su detalle + comentarios (GET /api/animals/:id/comments)
        - Formulario para crear un comentario (POST /api/animals/:id/comments)
          mostrando el error 400 de Zod si el comentario es muy corto
      */}
    </div>
  );
}

export default App;