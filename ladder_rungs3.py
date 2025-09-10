import numpy as np
import plotly.graph_objects as go

# Re-import data after environment reset
phi = (1 + np.sqrt(5)) / 2
f0, f2, f_omega = 144.72, 180.72, 160.5
theta_omega = 2.62594
r_omega = theta_omega / (2 * np.pi)

# Harmonic ladder
n_vals = np.arange(-5, 6)
frequencies = f0 * (phi ** n_vals)

# World state mapping
world_states = {
    -5: ("Primordial vacuum vibration", "cosmic"),
    -3: ("Molecular infra-vibrational dynamics", "physical"),
    -2: ("Infrared biological signaling", "biological"),
    -1: ("Pre-conscious states", "biological"),
     0: ("Photonic consciousness bridge", "metaphysical"),
     1: ("Optical threshold – visible edge", "physical"),
     2: ("Excitonic energy band coupling", "physical"),
     3: ("UV quantum coherence", "cosmic"),
     5: ("Vacuum ultraviolet – cosmic seeding", "cosmic")
}

# Spiral parameters
a, b = 0.5, 0.15
theta = np.linspace(0, 12 * np.pi, 4000)
r = a * np.exp(b * theta)
x1, y1, z1 = r * np.cos(theta), r * np.sin(theta), np.log1p(r)
x2, y2, z2 = -r * np.cos(theta), -r * np.sin(theta), np.log1p(r)

# Node coordinates
layer_colors = {"physical": "blue", "biological": "green", "metaphysical": "gold", "cosmic": "purple"}
node_coords = []
for i, n in enumerate(n_vals):
    angle = np.log(frequencies[i] / 36.18) / b
    radius = a * np.exp(b * angle)
    x, y, z = radius * np.cos(angle), radius * np.sin(angle), np.log1p(radius)
    desc, layer = world_states.get(n, ("Unknown", "physical"))
    node_coords.append((x, y, z, frequencies[i], desc, layer))

# Create 3D figure
fig = go.Figure()

# Energy field surface
theta_grid = np.linspace(0, 8 * np.pi, 200)
r_grid = np.linspace(0.1, 10, 200)
Theta, R = np.meshgrid(theta_grid, r_grid)
X = R * np.cos(Theta)
Y = R * np.sin(Theta)
Z = np.log1p(R)
Energy = np.exp(-0.15 * R) * (1 + np.cos(3 * Theta))
fig.add_trace(go.Surface(x=X, y=Y, z=Z, surfacecolor=Energy,
                         colorscale="Inferno", opacity=0.4, showscale=False))

# Add spirals
fig.add_trace(go.Scatter3d(x=x1, y=y1, z=z1, mode='lines', line=dict(color='white', width=3), name="Spiral A"))
fig.add_trace(go.Scatter3d(x=x2, y=y2, z=z2, mode='lines', line=dict(color='cyan', width=3), name="Spiral B"))

# Add nodes with hover info
for x, y, z, f, desc, layer in node_coords:
    fig.add_trace(go.Scatter3d(
        x=[x], y=[y], z=[z], mode='markers+text',
        text=[f"{f:.2f} THz<br>{desc}<br>Layer: {layer}"],
        textposition="top center",
        marker=dict(size=7, color=layer_colors[layer], line=dict(color='black', width=1)),
        name=f"{f:.2f} THz"
    ))

# Echo-gate arcs
for x, y, z, f, desc, layer in node_coords:
    arc_theta = np.linspace(0, np.pi, 50)
    arc_x = x + 0.3 * np.cos(arc_theta)
    arc_y = y + 0.3 * np.sin(arc_theta)
    arc_z = z + 0.1 * np.sin(arc_theta)
    fig.add_trace(go.Scatter3d(x=arc_x, y=arc_y, z=arc_z, mode='lines',
                               line=dict(color='magenta', width=2, dash='dot'),
                               name="Echo Gate"))

# Quasiparticle dynamics lines
omega_node = [node for node in node_coords if abs(node[3] - f_omega) < 5]
if omega_node:
    xΩ, yΩ, zΩ, _, _, _ = omega_node[0]
    for x, y, z, f, desc, layer in node_coords:
        fig.add_trace(go.Scatter3d(x=[xΩ, x], y=[yΩ, y], z=[zΩ, z],
                                   mode='lines', line=dict(color='lime', width=1), name="Ω Dynamics"))

# Layout
fig.update_layout(
    title="Ω-Manifold Gate – Dynamic 3D World-State Layers",
    scene=dict(xaxis=dict(visible=False), yaxis=dict(visible=False), zaxis=dict(visible=False)),
    template="plotly_dark",
    showlegend=False
)

fig.show()
