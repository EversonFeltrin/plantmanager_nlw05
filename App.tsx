import React, { useEffect } from  'react';
import AppLoading from 'expo-app-loading';
import * as Notifications from 'expo-notifications';

import Routes from './src/routes'; // n precisa index pq por padrão busca o index
import { PlantProps } from './src/libs/storage';

import {
	useFonts,
	Jost_400Regular, 
	Jost_600SemiBold
} from '@expo-google-fonts/jost';

// export default pro react achar o app
export default function App() {
	const [ fontsLoaded ] = useFonts({
		Jost_400Regular,
		Jost_600SemiBold
	});

	// MONITORAMENTO DE NOTIFICAÇÕES
	useEffect(() => {
		// // monitorar as notificações
		// const subscription = Notifications.addNotificationReceivedListener(
		// 	async (notification) => {
		// 		const data = notification.request.content.data.plant as PlantProps;

		// 		console.log(data);
		// 	}
		// );

		// return () => subscription.remove();

		// // lista todas as notificações agendadas
		// async function notifications() {				
		// 	await Notifications.cancelAllScheduledNotificationsAsync();	// cancela todas
		// 	const data = await Notifications.getAllScheduledNotificationsAsync();

		// 	console.log('Notificações agendadas:');
		// 	console.log(data);
		// };

		// notifications();
	}, []);

	if (!fontsLoaded) 
		return <AppLoading />

	return (
		<Routes />
	);
};
