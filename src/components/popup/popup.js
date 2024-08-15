import { createApp } from 'vue'
import popup from './popup.vue';
import 'bootstrap/dist/css/bootstrap.min.css' 
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css';
const app = createApp(popup);

app.config.errorHandler = (err, instance, info) => {
    console.error('Vue Global Error Handler:', err, info);
    // Custom handling, such as logging to a server or showing a user-friendly message
};

app.mount('#app');
