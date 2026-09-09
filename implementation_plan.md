# Sistema de gestión de turnos de pádel

## Goal Description

Crear una plataforma SaaS para la reserva de canchas de pádel con tres roles de usuario (administrador del sistema, propietario del club y jugador), integración de IA para respuestas automáticas vía WhatsApp y pasarela de pago MercadoPago. La arquitectura debe ser escalable, moderna y permitir un número ilimitado de canchas.

## User Review Required

[!IMPORTANT]
> Revisa los componentes propuestos y confirma la pila tecnológica elegida. Cualquier cambio aquí impactará la arquitectura y el plazo de entrega.

- **Backend**: Node.js / Express con TypeScript (alternativa: Python / FastAPI). 
- **Frontend**: React + Next.js (SSR) + TailwindCSS. 
- **Base de datos**: PostgreSQL + Redis. 
- **Autenticación**: Firebase Auth (Google + email/password). 
- **Pagos**: MercadoPago SDK. 
- **IA**: OpenAI API (texto) envuelto en endpoint REST. 
- **WhatsApp**: Twilio WhatsApp Business API. 
- **Despliegue**: Docker + Docker‑Compose, posible migración a Kubernetes.

## Open Questions

- Ninguna pendiente. Todos los requisitos críticos se han cubierto.

## Proposed Changes

---
### Backend Service

#### [NEW] [backend](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/backend)
- Estructura monolítica con capas hexagonales: **Domain**, **Application**, **Infrastructure**.
- Endpoints REST: `/api/auth`, `/api/clubs`, `/api/courts`, `/api/reservations`, `/api/payments`, `/api/ai`.
- Integración con MercadoPago (Webhooks), Firebase Auth y Twilio.

---
### Frontend Web / PWA

#### [NEW] [frontend](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/frontend)
- Next.js app con rutas protegidas por roles.
- UI: vista **Admin**, vista **Club Owner**, vista **Cliente**.
- Componentes reutilizables (Calendario, Lista de pistas, Checkout).

---
### Database Schema

#### [NEW] [schema.sql](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/schema.sql)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role VARCHAR(20) CHECK (role IN ('admin','owner','player')),
    firebase_uid TEXT UNIQUE
);

CREATE TABLE clubs (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES users(id),
    max_courts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE courts (
    id UUID PRIMARY KEY,
    club_id UUID REFERENCES clubs(id),
    name TEXT NOT NULL,
    surface VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY,
    court_id UUID REFERENCES courts(id),
    user_id UUID REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending','confirmed','canceled')),
    payment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    reservation_id UUID REFERENCES reservations(id),
    mercado_id TEXT,
    amount NUMERIC(10,2),
    status VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---
### IA Bot Service

#### [NEW] [ai_service](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/ai_service)
- Wrapper FastAPI que recibe texto (WhatsApp webhook) y llama a OpenAI / Claude.
- Respuestas contextuales: “¿Cuál es mi reserva?”, “¿Cuándo está libre la pista X?”.

---
### WhatsApp Integration

#### [NEW] [whatsapp_integration](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/whatsapp_integration)
- Endpoint Twilio que recibe mensajes, los reenvía al **ai_service** y envía respuestas usando la API de Twilio.

---
### CI / CD Pipeline

#### [NEW] [ci_cd.yml](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/ci_cd.yml)
- GitHub Actions: lint, tests, Docker build, deploy to Azure/AWS ECS.

---
### Tests

#### [NEW] [tests](file:///C:/Users/Martin/.gemini/antigravity/brain/2a09830e-0038-4828-a454-be3b8ef91bb4/tests)
- Unit tests (Jest for frontend, Jest+Supertest for backend). 
- Integration tests covering reserva → payment → webhook flow.

## Verification Plan

### Automated Tests
- `npm run test` (backend & frontend) → 80 % coverage.
- End‑to‑end test con Cypress que simula reserva completa y pago.

### Manual Verification
- Acceder a la UI como **admin**, crear un club y asignar 5 pistas.
- Como **owner**, ajustar horarios y precios.
- Como **jugador**, reservar una pista, pagar vía MercadoPago y recibir confirmación por WhatsApp.
- Probar preguntas al bot (ej. “¿Mi reserva es mañana a las 18?”).

### Performance Checks
- Simular 500 consultas simultáneas a `/api/availability` usando k6; debe responder < 200 ms.

---
**Next steps**
1. Aprobar la pila tecnológica y los componentes listados.
2. Crear el repositorio inicial y configurar CI.
3. Implementar la capa de dominio y la API de disponibilidad.

*Una vez aprobado, procederé con la implementación.*
