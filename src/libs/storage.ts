import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';
export interface PlantProps {
    id: string;
    name: string;
    about: string;
    water_tips: string;
    photo: string;
    environments: [string];
    frequency: {
        times: number;
        repeat_every: string;
    },
    hour: string;
    dateTimeNotification: Date;
};

export interface StoragePlantProps {
    // recebe o id dinâmico
    [id: string]: {
        data: PlantProps;
        notificationId: string;
    }
};

//Pode pegar do expo-notifications mesmo
// import { DailyTriggerInput, WeeklyTriggerInput } from 'expo-notifications/build/NotificationScheduler.types';

// const nextTime = new Date(plant.dateTimeNotification)

// const hour = getHours(nextTime)
// const minute = getMinutes(nextTime)
// const weekday = getDay(nextTime)

// const { times, repeat_every } = plant.frequency

// const dailyTrigger: DailyTriggerInput = {
//     hour,
//     minute,
//     repeats: true
// }

// const weeklyTrigger: WeeklyTriggerInput = {
//     hour,
//     minute,
//     weekday,
//     repeats: true
// }

// const notificationId = await Notifications.scheduleNotificationAsync({
//     content: {
//         title: 'Heeey',
//         body: `Está na hora de cuidar da sua ${plant.name}`,
//         sound: true,
//         priority: Notifications.AndroidNotificationPriority.HIGH,
//         data: {
//             plant
//         }
//     },
//     trigger: repeat_every === 'week'
//         ? weeklyTrigger
//         : dailyTrigger
// })

export async function savePlant(plant: PlantProps): Promise<void> {
    try {
        const nextTime = new Date(plant.dateTimeNotification);
        const now = new Date();

        const { times, repeat_every } = plant.frequency;
        if(repeat_every === 'week') {
            // descobrir quantas vezes vamos lembrar user
            const interval = Math.trunc(7 / times); // entender isso??
            nextTime.setDate(now.getDate() + interval);
        } 
        else { // seta para mostrar no dia seguinte, + 1
            nextTime.setDate(nextTime.getDate() + 1)
        }

        // pegar quantos segundos existe da data de agora até a p[ŕoxima data para lembrar, agendamento em segundos
        const seconds = Math.abs(Math.ceil((now.getTime() - nextTime.getTime()) / 1000));

        // getemoji.com
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Heeey, 🌱',
                body: `Èstá na hora de cuidar da sua ${plant.name}`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { // payload enviado junto a notificação
                    plant
                }
            },
            trigger: {
                seconds: seconds < 60 ? 60 : seconds,
                repeats: true
            }
        });

        // AsyncStorage salva como texto
        const data = await AsyncStorage.getItem("@plantmanager:plants");
        const oldPlants = data ? JSON.parse(data) as StoragePlantProps : {};

        const newPlant = {
            [plant.id]: {
                data: plant,
                notificationId
            }
        };

        await AsyncStorage.setItem(
            '@plantmanager:plants', 
            JSON.stringify({
                ...newPlant, // adiciona a nova
                ...oldPlants // mantem a antiga
            })
        );
    } catch (error) {
        throw new Error(error);
        
    }
};

export async function loadPlants(): Promise<PlantProps[]> {
    try {
        // AsyncStorage salva como texto
        const data = await AsyncStorage.getItem("@plantmanager:plants");
        const plants = data ? JSON.parse(data) as StoragePlantProps : {};

        const plantsSorted = Object
            .keys(plants)
            .map((plant) => {
                return {
                    ...plants[plant].data,
                    hour: format(new Date(plants[plant].data.dateTimeNotification), 'HH:mm')
                };
            })
            .sort((a, b) => 
                Math.floor(
                    new Date(a.dateTimeNotification).getTime() / 1000 -
                    Math.floor(new Date(b.dateTimeNotification).getTime() / 1000)
                )
            );

        return plantsSorted;
    } catch (error) {
        throw new Error(error);
        
    }
};

export async function removePlant(id: string): Promise<void> {
    const data = await AsyncStorage.getItem('@plantmanager:plants');
    const plants = data ? (JSON.parse(data)) as StoragePlantProps : {};

    await Notifications.cancelScheduledNotificationAsync(plants[id].notificationId);
    
    delete plants[id];

    await AsyncStorage.setItem(
        '@plantmanager:plants',
        JSON.stringify(plants)
    );    
};