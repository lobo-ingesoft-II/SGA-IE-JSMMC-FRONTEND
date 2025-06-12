// src/components/VistaPrematricula.tsx
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import logo from '../../../../assets/logo/logo.png';
import { departamentos } from '../../../../../data/autenticacion/departamentos';
import { sedes, tiposDocumento, paises, parentescos, sisbenSubcategorias } from '../../../../../data/autenticacion/prematriculaData';
import { FormData, initialForm } from '../../../../../models/autenticacion/prematriculaModel';
import { preRegistrar, generarPdfPreRegistro } from '../../../../../services/autenticacion/prematriculaService';

const VistaPrematricula: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const departamentosColombia = departamentos.map(d => d.nombre);
  const municipiosDepartamentoNacimiento = departamentos.find(d => d.nombre === form.departamentoNacimiento)?.municipios || [];
  const municipiosDepartamentoResidencia = departamentos.find(d => d.nombre === form.departamentoResidencia)?.municipios || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'categoriaSisben' && { subcategoriaSisben: '' }),
      ...(name === 'paisNacimiento' && { departamentoNacimiento: '', municipioNacimiento: '' }),
      ...(name === 'departamentoNacimiento' && { municipioNacimiento: '' }),
      ...(name === 'paisResidencia' && { departamentoResidencia: '', municipioResidencia: '' }),
      ...(name === 'departamentoResidencia' && { municipioResidencia: '' }),
      ...(name === 'discapacidad' && value !== 'SI' && { detalleDiscapacidad: '' }),
      ...(name === 'poblacionDesplazada' && value !== 'SI' && { fechaDesplazamiento: '' }),
      ...(name === 'tipoDocumento' && { numeroDocumento: '' }),
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, boolean> = {};
    const required = [
      'apellidos','nombres','tipoDocumento','numeroDocumento','fechaNacimiento',
      'paisNacimiento','departamentoNacimiento','municipioNacimiento',
      'categoriaSisben','subcategoriaSisben','direccionResidencia','telefono',
      'discapacidad', form.discapacidad==='SI' ? 'detalleDiscapacidad' : '',
      'poblacionDesplazada', form.poblacionDesplazada==='SI' ? 'fechaDesplazamiento' : '',
      'paisResidencia','departamentoResidencia','municipioResidencia',
      'gradoIngreso','municipioAnterior','sede',
      'acudiente1Parentesco','acudiente1Apellidos','acudiente1Nombres','acudiente1CC','acudiente1Celular','acudiente1Ocupacion'
    ];
    required.forEach(field => {
      if (field && !form[field as keyof FormData]) newErrors[field] = true;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShowErrorAlert(true);
      return;
    }
    setShowErrorAlert(false);
    try {
      const id = await preRegistrar(form);
      alert('Estudiante registrado correctamente');
      setForm(initialForm);
      const pdfBlob = await generarPdfPreRegistro(id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pre_registro_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert('Hubo un error en el registro o descarga del PDF');
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: '100%', sm: '90%', md: '900px' },
        mx: 'auto',
        p: { xs: 1, sm: 2, md: 4 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        '& .MuiTextField-root': {
          width: '100%',
          boxSizing: 'border-box',
        },
      }}
    >
      <Snackbar
        open={showErrorAlert}
        autoHideDuration={4000}
        onClose={() => setShowErrorAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setShowErrorAlert(false)} severity="error" sx={{ width: '100%', fontSize: '1.2rem', py: 2 }}>
          Por favor, rellene todos los campos requeridos.
        </MuiAlert>
      </Snackbar>
      <form onSubmit={handleSubmit} noValidate>
        <Stack spacing={2} alignItems="center" mb={4}>
          <img src={logo} width={150} alt="Logo IED Josué Manrique" />
          <Typography variant="h4" align="center">Formulario de Matrícula IED Josué Manrique</Typography>
        </Stack>

        {/* INFORMACIÓN PERSONAL */}
        <Typography variant="h5" mb={2}>
          1. INFORMACIÓN PERSONAL DEL ESTUDIANTE
        </Typography>
        <Stack direction={isDesktop ? 'row' : 'column'} spacing={3} width="100%" mb={4}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} error={!!errors.apellidos} helperText={errors.apellidos ? 'Este campo es obligatorio' : ''} fullWidth />
            <TextField label="Nombres" name="nombres" value={form.nombres} onChange={handleChange} error={!!errors.nombres} helperText={errors.nombres ? 'Este campo es obligatorio' : ''} fullWidth />
            <TextField
              select
              label="Tipo de documento"
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              error={!!errors.tipoDocumento}
              helperText={errors.tipoDocumento ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {tiposDocumento.map(tipo => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
            {form.tipoDocumento && (
              <TextField
                label="Número de documento (sin puntos ni comas)"
                name="numeroDocumento"
                value={form.numeroDocumento}
                onChange={handleChange}
                error={!!errors.numeroDocumento}
                helperText={errors.numeroDocumento ? 'Este campo es obligatorio' : ''}
                fullWidth
              />
            )}
            <TextField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              error={!!errors.fechaNacimiento}
              helperText={errors.fechaNacimiento ? 'Este campo es obligatorio' : ''}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="País de Nacimiento"
              name="paisNacimiento"
              value={form.paisNacimiento}
              onChange={handleChange}
              error={!!errors.paisNacimiento}
              helperText={errors.paisNacimiento ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
              <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
              {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
                <MenuItem key={pais} value={pais}>{pais}</MenuItem>
              ))}
            </TextField>
            {form.paisNacimiento === 'COLOMBIA' && (
              <TextField
                select
                label="Departamento de Nacimiento"
                name="departamentoNacimiento"
                value={form.departamentoNacimiento}
                onChange={handleChange}
                error={!!errors.departamentoNacimiento}
                helperText={errors.departamentoNacimiento ? 'Este campo es obligatorio' : ''}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {departamentosColombia.map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </TextField>
            )}
            {form.paisNacimiento === 'COLOMBIA' && form.departamentoNacimiento && (
              <TextField
                select
                label="Municipio de Nacimiento"
                name="municipioNacimiento"
                value={form.municipioNacimiento}
                onChange={handleChange}
                error={!!errors.municipioNacimiento}
                helperText={errors.municipioNacimiento ? 'Este campo es obligatorio' : ''}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {municipiosDepartamentoNacimiento.map(mun => (
                  <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              label="Categoría SISBEN"
              name="categoriaSisben"
              value={form.categoriaSisben}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </TextField>
            <TextField
              select
              label="Subcategoría SISBEN"
              name="subcategoriaSisben"
              value={form.subcategoriaSisben}
              onChange={handleChange}
              disabled={!form.categoriaSisben}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {form.categoriaSisben &&
                sisbenSubcategorias[form.categoriaSisben].map(sub => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
            </TextField>
          </Stack>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Dirección de Residencia" name="direccionResidencia" value={form.direccionResidencia} onChange={handleChange} error={!!errors.direccionResidencia} helperText={errors.direccionResidencia ? 'Este campo es obligatorio' : ''} fullWidth />
            <TextField label="Teléfono / Celular" name="telefono" value={form.telefono} onChange={handleChange} fullWidth />
            <TextField label="Ruta Escolar" name="rutaEscolar" value={form.rutaEscolar} onChange={handleChange} fullWidth />
            <TextField label="Seguro Médico (EPS)" name="seguroMedico" value={form.seguroMedico} onChange={handleChange} fullWidth />
            <TextField
              select
              label="Discapacidad"
              name="discapacidad"
              value={form.discapacidad}
              onChange={handleChange}
              error={!!errors.discapacidad}
              helperText={errors.discapacidad ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="SI">SI</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </TextField>
            {form.discapacidad === 'SI' && (
              <TextField
                label="Especifique la discapacidad"
                name="detalleDiscapacidad"
                value={form.detalleDiscapacidad}
                onChange={handleChange}
                error={!!errors.detalleDiscapacidad}
                helperText={errors.detalleDiscapacidad ? 'Este campo es obligatorio' : ''}
                multiline
                minRows={2}
                fullWidth
              />
            )}
            <TextField
              select
              label="Población Desplazada"
              name="poblacionDesplazada"
              value={form.poblacionDesplazada}
              onChange={handleChange}
              error={!!errors.poblacionDesplazada}
              helperText={errors.poblacionDesplazada ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="SI">SI</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </TextField>
            {form.poblacionDesplazada === 'SI' && (
              <TextField
                label="Fecha de Desplazamiento"
                name="fechaDesplazamiento"
                type="date"
                value={form.fechaDesplazamiento}
                onChange={handleChange}
                error={!!errors.fechaDesplazamiento}
                helperText={errors.fechaDesplazamiento ? 'Este campo es obligatorio' : ''}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
            <TextField
              select
              label="País de Residencia"
              name="paisResidencia"
              value={form.paisResidencia}
              onChange={handleChange}
              error={!!errors.paisResidencia}
              helperText={errors.paisResidencia ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
              <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
              {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
                <MenuItem key={pais} value={pais}>{pais}</MenuItem>
              ))}
            </TextField>
            {form.paisResidencia === 'COLOMBIA' && (
              <TextField
                select
                label="Departamento de Residencia"
                name="departamentoResidencia"
                value={form.departamentoResidencia}
                onChange={handleChange}
                error={!!errors.departamentoResidencia}
                helperText={errors.departamentoResidencia ? 'Este campo es obligatorio' : ''}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {departamentosColombia.map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </TextField>
            )}
            {form.paisResidencia === 'COLOMBIA' && form.departamentoResidencia && (
              <TextField
                select
                label="Municipio de Residencia"
                name="municipioResidencia"
                value={form.municipioResidencia}
                onChange={handleChange}
                error={!!errors.municipioResidencia}
                helperText={errors.municipioResidencia ? 'Este campo es obligatorio' : ''}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {municipiosDepartamentoResidencia.map(mun => (
                  <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Stack>

        {/* INFORMACIÓN ACADÉMICA */}
        <Typography variant="h5" mb={2} mt={4}>
          2. INFORMACIÓN ACADÉMICA
        </Typography>
        <Stack direction={isDesktop ? 'row' : 'column'} spacing={3} width="100%" mb={4}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField
              select
              label="Grado al que ingresa"
              name="gradoIngreso"
              value={form.gradoIngreso}
              onChange={handleChange}
              error={!!errors.gradoIngreso}
              helperText={errors.gradoIngreso ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="Primero">Primero</MenuItem>
              <MenuItem value="Segundo">Segundo</MenuItem>
              <MenuItem value="Tercero">Tercero</MenuItem>
              <MenuItem value="Cuarto">Cuarto</MenuItem>
              <MenuItem value="Quinto">Quinto</MenuItem>
              <MenuItem value="Sexto">Sexto</MenuItem>
              <MenuItem value="Séptimo">Séptimo</MenuItem>
              <MenuItem value="Octavo">Octavo</MenuItem>
              <MenuItem value="Noveno">Noveno</MenuItem>
              <MenuItem value="Décimo">Décimo</MenuItem>
              <MenuItem value="Once">Once</MenuItem>
            </TextField>
            <TextField label="Institución de donde viene" name="institucionAnterior" value={form.institucionAnterior} onChange={handleChange} error={!!errors.institucionAnterior} helperText={errors.institucionAnterior ? 'Este campo es obligatorio' : ''} fullWidth />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Municipio" name="municipioAnterior" value={form.municipioAnterior} onChange={handleChange} fullWidth />
            <TextField
              select
              label="Sede"
              name="sede"
              value={form.sede}
              onChange={handleChange}
              error={!!errors.sede}
              helperText={errors.sede ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {sedes.map(sede => (
                <MenuItem key={sede} value={sede}>{sede}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* INFORMACIÓN FAMILIAR */}
        <Typography variant="h5" mb={2} mt={4}>
          3. INFORMACIÓN FAMILIAR
        </Typography>
        <Stack spacing={2} width="100%" mb={4}>
          <Typography variant="subtitle1" mt={1}>
            Acudiente 1
          </Typography>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField
              select
              label="Parentesco"
              name="acudiente1Parentesco"
              value={form.acudiente1Parentesco}
              onChange={handleChange}
              error={!!errors.acudiente1Parentesco}
              helperText={errors.acudiente1Parentesco ? 'Este campo es obligatorio' : ''}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {parentescos.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label="Apellidos" name="acudiente1Apellidos" value={form.acudiente1Apellidos} onChange={handleChange}error={!!errors.acudiente1Apellidos} helperText={errors.acudiente1Apellidos ? 'Este campo es obligatorio' : ''} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Nombres" name="acudiente1Nombres" value={form.acudiente1Nombres} onChange={handleChange} error={!!errors.acudiente1Apellidos} helperText={errors.acudiente1Nombres ? 'Este campo es obligatorio' : ''} fullWidth />
            <TextField label="Número de cédula" name="acudiente1CC" value={form.acudiente1CC} onChange={handleChange} error={!!errors.acudiente1CC} helperText={errors.acudiente1CC ? 'Este campo es obligatorio' : ''} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Número de celular" name="acudiente1Celular" value={form.acudiente1Celular} onChange={handleChange} error={!!errors.acudiente1Celular} helperText={errors.acudiente1Celular ? 'Este campo es obligatorio' : ''} fullWidth />
            <TextField label="Ocupación" name="acudiente1Ocupacion" value={form.acudiente1Ocupacion} onChange={handleChange} error={!!errors.acudiente1Ocupacion} helperText={errors.acudiente1Ocupacion ? 'Este campo es obligatorio' : ''} fullWidth />
          </Stack>

          <Typography variant="subtitle1" mt={2}>
            Acudiente 2
          </Typography>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField
              select
              label="Parentesco"
              name="acudiente2Parentesco"
              value={form.acudiente2Parentesco}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {parentescos.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label="Apellidos" name="acudiente2Apellidos" value={form.acudiente2Apellidos} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Nombres" name="acudiente2Nombres" value={form.acudiente2Nombres} onChange={handleChange} fullWidth />
            <TextField label="C.C. N°" name="acudiente2CC" value={form.acudiente2CC} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Celular" name="acudiente2Celular" value={form.acudiente2Celular} onChange={handleChange} fullWidth />
            <TextField label="Ocupación" name="acudiente2Ocupacion" value={form.acudiente2Ocupacion} onChange={handleChange} fullWidth />
          </Stack>
        </Stack>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 4, py: 1.5 }}>
          Registrar Estudiante
        </Button>
      </form>
    </Paper>
  );
};

export default VistaPrematricula;



