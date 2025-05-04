import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Contact.css";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Contact = () => {
  return (
    <div className="contact-container">
      <div className="contact-map">
        <MapContainer
          center={[47.47312, 19.05952]} // Budapest
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[47.47312, 19.05952]}>
            <Popup>HomeLy HQ - Budapest</Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="contact-details">
        <h2>Get in Touch</h2>

        <div>
          <strong>Address:</strong><br />
          HomeLy Studio Kft.<br />
          1051 Budapest, Deák Ferenc utca 3.
        </div>

        <div>
          <strong>Phone:</strong><br />
          +36 1 234 5678<br />
          +36 30 123 4567
        </div>

        <div>
          <strong>Email:</strong><br />
          hello@homely.studio<br />
          support@homely.studio
        </div>

        <div>
          <strong>Office Hours:</strong><br />
          Monday-Friday: 9:00 - 17:00<br />
          Saturday-Sunday: Closed
        </div>

        <div>
          <strong>Social Media:</strong><br />
          Facebook · Instagram · LinkedIn
        </div>
      </div>
    </div>
  );
};

export default Contact;