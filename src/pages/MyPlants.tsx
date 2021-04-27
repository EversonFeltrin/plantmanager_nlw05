import React, { useState, useEffect } from 'react';
import { 
    StyleSheet,
    View,
    Text,
    Image,
    Alert
} from 'react-native';
import { Header } from '../components/Header';
import { FlatList } from 'react-native-gesture-handler';
import { formatDistance } from 'date-fns';
import { pt } from 'date-fns/locale';

import { PlantProps, loadPlants, removePlant } from '../libs/storage';
import { Load } from '../components/Load';
import { PlantCardSecondary } from '../components/PlanCardSecondary';

import waterdrop from '../assets/waterdrop.png';
import colors from '../styles/colors';
import fonts from '../styles/fonts';

export function MyPlants() {
    const [myPlants, setMyPlants] = useState<PlantProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextWatered, setNextWatered] = useState<string>();

    function handleRemove(plant: PlantProps) {
        Alert.alert('Remover', `Deseja remover à ${plant.name}?`, [
            {
                text: 'Não 🙏',
                style: 'cancel'
            },
            {
                text: 'Sim 😢',
                onPress: async () => {
                    try {
                        await removePlant(plant.id);

                        setMyPlants((oldData) => oldData.filter((item) => item.id !== plant.id));  
                    } catch (error) {
                        Alert.alert('Não foi possível remover! 😢');
                    }
                }
            },
        ])
        
    }

    useEffect(() => {
        async function loadStorageData() {
            const plantsStoraged = await loadPlants();

            // pegar a distancia de uma data para outra -> faz com que retorne o tempo que falta para regar
            const nextTime = formatDistance(
                new Date(plantsStoraged[0].dateTimeNotification).getTime(), // pega a primeira posição, data mais proxima
                new Date().getTime(), // data de agora
                { locale: pt}
            );

            setNextWatered(`Não esqueça de regar a ${plantsStoraged[0].name} à ${nextTime}`);
            setMyPlants(plantsStoraged);
            setLoading(false);
        }

        loadStorageData();
    }, []);

    if (loading) return <Load />

    return (
        <View style={styles.container}>
            <Header />

            <View style={styles.spotlight}>
                <Image 
                    source={waterdrop}
                    style={styles.spotlightImage}
                />

                <Text style={styles.spotlightText}>
                    {nextWatered}
                </Text>
            </View>

            <View style={styles.plants}>
                <Text style={styles.plantsTitle}>
                    Próximas regadas
                </Text>

                <FlatList 
                    data={myPlants}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({item}) => (
                        <PlantCardSecondary 
                            data={item} 
                            handleRemove={() => handleRemove(item)}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    //contentContainerStyle={{flex: 1}} -> n deixa o scroll funcionar
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 50,
        backgroundColor: colors.background
    },
    spotlight: {
        backgroundColor: colors.blue_light,
        paddingHorizontal: 20,
        borderRadius: 20,
        height: 110,
        flexDirection: 'row',
        alignItems: 'center'
    },
    spotlightImage: {
        width: 60,
        height: 60
    },
    spotlightText: {
        flex: 1,
        color: colors.blue,
        paddingHorizontal: 20,
    },
    plants: {
        flex: 1, 
        width: '100%'
    },
    plantsTitle: {
        fontSize: 24,
        fontFamily: fonts.heading,
        color: colors.heading,
        marginVertical: 20
    }
});