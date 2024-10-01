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
    Snackbar,
    Alert,
    Box,
    Slider,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Visibility,
    Add,
    FilterAlt,
    Refresh,
    Warning,
    ErrorOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { epiService, controlService } from '../services/api';
import { Epi } from '../types';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';

const AlertesPage: React.FC = () => {
    const navigate = useNavigate();
    const [epis, setEpis] = useState<Epi[]>([]);
    const [daysThreshold, setDaysThreshold] = useState<number>(30);
    const [loading, setLoading] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchEpisWithUpcomingControls();
    }, [daysThreshold]);

    const fetchEpisWithUpcomingControls = async () => {
        setLoading(true);
        try {
            const data = await epiService.getAlerts(daysThreshold);
            setEpis(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur lors du chargement des alertes:', error);
            setSnackbar({ open: true, message: 'Erreur lors du chargement des alertes', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewEpiDetails = (id: number) => {
        navigate(`/epi/${id}`);
    };

    const handleCreateControle = (epi: Epi) => {
        navigate('/controles/new', { state: { epiId: epi.id } });
    };

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        try {
            if (typeof dateString === 'string') {
                return format(parseISO(dateString), 'dd/MM/yyyy', { locale: frLocale });
            }
            return format(dateString, 'dd/MM/yyyy', { locale: frLocale });
        } catch (error) {
            return '-';
        }
    };

    const calculateNextControlDate = (epi: Epi) => {
        if (!epi.dernier_controle && !epi.date_mise_service) return '-';

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return '-';

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return '-';

        return formatDate(addDays(baseDate, periodicite));
    };

    const getDaysRemaining = (epi: Epi) => {
        if (!epi.dernier_controle && !epi.date_mise_service) return null;

        const baseDate = epi.dernier_controle ? new Date(epi.dernier_controle) :
            epi.date_mise_service ? new Date(epi.date_mise_service) : null;

        if (!baseDate) return null;

        const periodicite = epi.periodicite_controle ||
            (epi.type_epi?.periodicite_controle || 0);

        if (periodicite <= 0) return null;

        const nextControlDate = addDays(baseDate, periodicite);
        return differenceInDays(nextControlDate, new Date());
    };

    const getUrgencyColor = (daysRemaining: number | null) => {
        if (daysRemaining === null) return 'inherit';
        if (daysRemaining < 0) return 'error.main';
        if (daysRemaining < 7) return 'error.main';
        if (daysRemaining < 15) return 'warning.main';
        return 'success.main';
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Alertes pour contrôles à venir
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Refresh />}
                    onClick={fetchEpisWithUpcomingControls}
                    disabled={loading}
                >
                    Actualiser
                </Button>
            </Box>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Paramètres d'alerte
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography id="days-threshold-slider" gutterBottom>
                                Afficher les EPI nécessitant un contrôle dans les X jours:
                            </Typography>
                            <Slider
                                value={daysThreshold}
                                onChange={(_, newValue) => setDaysThreshold(newValue as number)}
                                aria-labelledby="days-threshold-slider"
                                valueLabelDisplay="auto"
                                step={5}
                                marks
                                min={5}
                                max={90}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Jours"
                                type="number"
                                value={daysThreshold}
                                onChange={(e) => setDaysThreshold(Number(e.target.value))}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FilterAlt />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {epis.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        Aucun EPI ne nécessite de contrôle dans les {daysThreshold} prochains jours.
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Identifiant</TableCell>
                                <TableCell>Marque / Modèle</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Dernier contrôle</TableCell>
                                <TableCell>Prochain contrôle</TableCell>
                                <TableCell>Jours restants</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {epis.map((epi) => {
                                const daysRemaining = getDaysRemaining(epi);
                                return (
                                    <TableRow key={epi.id} sx={{ bgcolor: daysRemaining && daysRemaining < 0 ? 'error.lighter' : 'inherit' }}>
                                        <TableCell>{epi.identifiant_perso}</TableCell>
                                        <TableCell>{`${epi.marque} ${epi.modele}`}</TableCell>
                                        <TableCell>{epi.type_epi?.libelle || '-'}</TableCell>
                                        <TableCell>{formatDate(epi.dernier_controle || epi.date_mise_service)}</TableCell>
                                        <TableCell>{calculateNextControlDate(epi)}</TableCell>
                                        <TableCell>
                                            <Typography color={getUrgencyColor(daysRemaining)}>
                                                {daysRemaining !== null ? (
                                                    daysRemaining < 0 ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <ErrorOutline sx={{ mr: 1 }} />
                                                            En retard de {Math.abs(daysRemaining)} jour(s)
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            {daysRemaining < 15 && <Warning sx={{ mr: 1 }} />}
                                                            {daysRemaining} jour(s)
                                                        </Box>
                                                    )
                                                ) : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleViewEpiDetails(epi.id!)} color="primary" size="small">
                                                <Visibility />
                                            </IconButton>
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleCreateControle(epi)}
                                                startIcon={<Add />}
                                            >
                                                Contrôle
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

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

export default AlertesPage;