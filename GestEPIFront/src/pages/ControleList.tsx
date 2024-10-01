import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Snackbar,
    Alert,
    Box,
    Grid,
    SelectChangeEvent
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { controlService, epiService, managerService, controlStatusService } from '../services/api';
import { Controle, Epi, Gestionnaire, StatutControle } from '../types';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr as frLocale } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';

const ControleList: React.FC = () => {
    const navigate = useNavigate();
    const [controles, setControles] = useState<Controle[]>([]);
    const [epis, setEpis] = useState<Epi[]>([]);
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);
    const [statuts, setStatuts] = useState<StatutControle[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentControle, setCurrentControle] = useState<Partial<Controle>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchControles();
        fetchEpis();
        fetchGestionnaires();
        fetchStatuts();
    }, []);

    const fetchControles = async () => {
        try {
            const data = await controlService.getAll();
            setControles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des contrôles:', error);
            setSnackbar({ open: true, message: 'Erreur lors du chargement des contrôles', severity: 'error' });
        }
    };

    const fetchEpis = async () => {
        try {
            const data = await epiService.getAll();
            setEpis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des EPI:', error);
        }
    };

    const fetchGestionnaires = async () => {
        try {
            const data = await managerService.getAll();
            setGestionnaires(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des gestionnaires:', error);
        }
    };

    const fetchStatuts = async () => {
        try {
            const data = await controlStatusService.getAll();
            setStatuts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des statuts:', error);
        }
    };

    const handleAddClick = () => {
        setCurrentControle({
            date_controle: new Date()
        });
        setIsEditing(false);
        setOpenDialog(true);
    };

    const handleEditClick = (controle: Controle) => {
        setCurrentControle({ ...controle });
        setIsEditing(true);
        setOpenDialog(true);
    };

    const handleViewDetails = (id: number) => {
        navigate(`/controles/${id}`);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrôle ?')) {
            try {
                await controlService.delete(id);
                setSnackbar({ open: true, message: 'Contrôle supprimé avec succès', severity: 'success' });
                fetchControles();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                setSnackbar({ open: true, message: 'Erreur lors de la suppression du contrôle', severity: 'error' });
            }
        }
    };

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        const name = e.target.name || "";
        const value = e.target.value;
        setCurrentControle({ ...currentControle, [name]: value });
    };

    const handleDateChange = (date: Date | null) => {
        setCurrentControle({
            ...currentControle,
            date_controle: date === null ? undefined : date
        });
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && currentControle.id) {
                await controlService.update(currentControle.id, currentControle);
                setSnackbar({ open: true, message: 'Contrôle mis à jour avec succès', severity: 'success' });
            } else {
                await controlService.create(currentControle);
                setSnackbar({ open: true, message: 'Contrôle créé avec succès', severity: 'success' });
            }
            handleDialogClose();
            fetchControles();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            setSnackbar({ open: true, message: 'Erreur lors de l\'enregistrement du contrôle', severity: 'error' });
        }
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            if (typeof dateString === 'string') {
                return format(parseISO(dateString), 'dd/MM/yyyy');
            }
            return format(dateString, 'dd/MM/yyyy');
        } catch (error) {
            return '-';
        }
    };

    const getEpiLabel = (epiId: number) => {
        const epi = epis.find(e => e.id === epiId);
        return epi ? `${epi.identifiant_perso} - ${epi.marque} ${epi.modele}` : '-';
    };

    const getGestionnaireLabel = (gestionnaireId: number) => {
        const gestionnaire = gestionnaires.find(g => g.id === gestionnaireId);
        return gestionnaire ? `${gestionnaire.nom} ${gestionnaire.prenom}` : '-';
    };

    const getStatutLabel = (statutId: number) => {
        const statut = statuts.find(s => s.id === statutId);
        return statut ? statut.libelle : '-';
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Gestion des Contrôles
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={handleAddClick}
                >
                    Ajouter un contrôle
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>EPI</TableCell>
                            <TableCell>Gestionnaire</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {controles.length > 0 ? (
                            controles.map((controle) => (
                                <TableRow key={controle.id}>
                                    <TableCell>{controle.id}</TableCell>
                                    <TableCell>{formatDate(controle.date_controle)}</TableCell>
                                    <TableCell>{controle.epi ? `${controle.epi.identifiant_perso} - ${controle.epi.marque}` : getEpiLabel(controle.epi_id)}</TableCell>
                                    <TableCell>{controle.gestionnaire ? `${controle.gestionnaire.nom} ${controle.gestionnaire.prenom}` : getGestionnaireLabel(controle.gestionnaire_id)}</TableCell>
                                    <TableCell>{controle.statut ? controle.statut.libelle : getStatutLabel(controle.statut_id)}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleViewDetails(controle.id!)} color="primary" size="small">
                                            <Visibility />
                                        </IconButton>
                                        <IconButton onClick={() => handleEditClick(controle)} color="primary" size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(controle.id!)} color="error" size="small">
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Aucun contrôle trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog pour ajouter/modifier un contrôle */}
            <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>{isEditing ? 'Modifier le contrôle' : 'Ajouter un contrôle'}</DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date du contrôle"
                                    value={currentControle.date_controle ? new Date(currentControle.date_controle) : null}
                                    onChange={handleDateChange}
                                    slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>EPI</InputLabel>
                                    <Select
                                        name="epi_id"
                                        value={currentControle.epi_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {epis.map((epi) => (
                                            <MenuItem key={epi.id} value={epi.id!.toString()}>
                                                {`${epi.identifiant_perso} - ${epi.marque} ${epi.modele}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Gestionnaire</InputLabel>
                                    <Select
                                        name="gestionnaire_id"
                                        value={currentControle.gestionnaire_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {gestionnaires.map((gestionnaire) => (
                                            <MenuItem key={gestionnaire.id} value={gestionnaire.id!.toString()}>
                                                {`${gestionnaire.nom} ${gestionnaire.prenom}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Statut</InputLabel>
                                    <Select
                                        name="statut_id"
                                        value={currentControle.statut_id?.toString() || ''}
                                        onChange={handleSelectChange}
                                        required
                                    >
                                        {statuts.map((statut) => (
                                            <MenuItem key={statut.id} value={statut.id!.toString()}>
                                                {statut.libelle}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Remarques"
                                    name="remarques"
                                    value={currentControle.remarques || ''}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={4}
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Annuler</Button>
                    <Button onClick={handleSubmit} color="primary" variant="contained">
                        {isEditing ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ControleList;