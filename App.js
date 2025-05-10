
import {  Route, Routes } from 'react-router-dom';
import './App.css';
import Weather from './weather';

function App() {
  return (<div>
<Routes>
  <Route path='/' element={<Weather></Weather>}></Route>
</Routes>
  </div>
  )
}
export default App;
