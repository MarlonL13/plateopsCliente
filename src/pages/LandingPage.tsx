import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { useNavigate } from "react-router-dom";
import { UseAuth } from "../auth/AuthContext";

const features = [
  {
    title: "Pedidos em tempo real",
    description:
      "Conecte salão, cozinha e caixa em um fluxo único com atualização instantânea.",
    icon: <BoltRoundedIcon color="primary" />,
  },
  {
    title: "Insights para decisão rápida",
    description:
      "Visualize desempenho, giro de mesas e status da operação com clareza.",
    icon: <AnalyticsRoundedIcon color="primary" />,
  },
  {
    title: "Controle seguro por perfil",
    description:
      "Acesso protegido para garçom, cozinha e caixa com permissões por função.",
    icon: <SecurityRoundedIcon color="primary" />,
  },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const { token, role } = UseAuth();

  const handleDemo = () => {
    if (token && role) {
      navigate(`/dashboard/${role.toLowerCase()}`);
      return;
    }

    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 10% 20%, rgba(29, 78, 216, 0.12), transparent 35%), radial-gradient(circle at 90% 10%, rgba(15, 118, 110, 0.12), transparent 40%), linear-gradient(180deg, #f8fbff 0%, #f6f7fb 100%)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)",
                color: "white",
              }}
            >
              <RocketLaunchRoundedIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={800}>
              PlateOps
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            component="a"
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Fale conosco
          </Button>
        </Stack>

        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Chip
              label="SaaS para operação de restaurante"
              color="primary"
              variant="outlined"
              sx={{ mb: 2, fontWeight: 600 }}
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                lineHeight: 1.1,
                fontSize: { xs: "1.75rem", md: "3rem" },
              }}
            >
              Agilidade no salão,
              <Box component="span" sx={{ color: "primary.main" }}>
                {" "}
                precisão na cozinha
              </Box>
              .
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mt: 1.5, maxWidth: 640, fontWeight: 400, fontSize: { xs: "1rem", md: "1.1rem" } }}
            >
              O PlateOps centraliza pedidos, fluxo entre equipes e pagamentos em
              uma experiência moderna para reduzir erros e acelerar atendimento.
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={handleDemo}
                sx={{
                  px: 3,
                  py: 1.3,
                  borderRadius: 3,
                  fontWeight: 700,
                  boxShadow: "0 10px 25px rgba(29, 78, 216, 0.25)",
                }}
              >
                Ver demo
              </Button>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Typography variant="overline" color="primary" fontWeight={700}>
                  Resultado esperado
                </Typography>
                <Typography variant="h5" sx={{ mt: 0.5, mb: 2.5, fontWeight: 800 }}>
                  Uma operação mais fluida do pedido ao pagamento
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Tempo médio de atendimento
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      -35% (meta)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                     Retrabalho de cozinha
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      0 (meta)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Visibilidade entre equipes
                    </Typography>
                    <Typography variant="h6" fontWeight={800}>
                      100% em tempo real
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5} sx={{ mt: { xs: 3, md: 5 } }}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    {feature.icon}
                    <Typography variant="h6" fontWeight={800}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
