import React, {useState, useEffect} from 'react';
import {ChevronDown, ChevronRight, X, Info} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from './components/ui/card/Card';
import {Total, TotalContent, TotalHeader} from "./components/ui/card/Total";
import './ServiceConfigurator.scss';
import './TotalPrice.css';
import axios from 'axios';
// import {Alert, AlertTitle, AlertDescription} from './components/ui/alert';

const ServiceConfigurator = () => {

    const AIRTABLE_API_KEY = 'patcaXmJ9vC3S6DsU.8258a1c6ba04d90df7c239bf98f841596112c8135c181378cebe737c4bc167d8';
    const AIRTABLE_BASE_ID = 'appGbjwYWNY96W6Vc'; //
    const TABLE_NAME = 'Offers';

    const [savedOffers, setSavedOffers] = useState([]);
    const [operators, setOperators] = useState([]);
    const [dataPacks, setDataPacks] = useState([]);
    const [additionalServices, setAdditionalServices] = useState([]);
    const [prices, setPrices] = useState({});
    const [selectedOperator, setSelectedOperator] = useState('');
    const [selectedDataPack, setSelectedDataPack] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedServices, setSelectedServices] = useState([]);
    const [offerSavedMessage, setOfferSavedMessage] = useState(false);
    const [totals, setTotals] = useState({ monthly: 0, oneTime: 0 });
    const [isOfferSaved, setIsOfferSaved] = useState(false); 

    useEffect(() => {
        const fetchAirtableData = async () => {
            try {
                const headers = {
                    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
                };

                const operatorsResponse = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/operators`, {headers});
                const dataPacksResponse = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/dataPacks`, {headers});
                const additionalServicesResponse = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/additionalServices`, {headers});
                const pricesResponse = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/prices`, {headers});

                if (dataPacksResponse?.data?.records) {
                    setDataPacks(
                        dataPacksResponse.data.records.map((record) => ({
                            id: record.fields.id,
                            size: record.fields.size,
                            display: record.fields.display,
                        }))
                    );
                } else {
                    console.warn("No records found in the API response");
                    setDataPacks([]);
                }

                setOperators(operatorsResponse.data.records.map(record => ({
                    id: record.fields.id,
                    name: record.fields.name,
                    description: record.fields.description,
                })));

                // setDataPacks(dataPacksResponse.data.records.map(record => ({
                //   id: record.fields.id,
                //   size: record.fields.size,
                //   display: record.fields.display,
                // })));

                setAdditionalServices(additionalServicesResponse.data.records.map(record => ({
                    id: record.fields.id,
                    name: record.fields.name,
                    description: record.fields.description,
                    monthlyPrice: record.fields.monthlyPrice,
                    oneTimePrice: record.fields.oneTimePrice,
                    features: record.fields.features,
                })));

                const formattedPrices = pricesResponse.data.records.reduce((acc, record) => {
                    const {Operator, DataPack, Price} = record.fields;

                    if (!acc[Operator]) {
                        acc[Operator] = {};
                    }
                    acc[Operator][DataPack] = Price || 'Ved forespørsel'; // Default to 'Ved forespørsel' if Price is missing
                    return acc;
                }, {});

                setPrices(formattedPrices); // Update state with formatted prices
            } catch (error) {
                console.error('Error fetching Airtable data:', error);
            }
        };

        fetchAirtableData();
    }, []);



    const getPriceForPack = (operator, pack) => {

        return prices[operator]?.[pack] || 'Ved forespørsel';
    };

    const basePrice = typeof getPriceForPack(selectedOperator, selectedDataPack) === 'number'
        ? getPriceForPack(selectedOperator, selectedDataPack)
        : 0;

    const calculateTotal = () => {
        const basePrice = typeof getPriceForPack(selectedOperator, selectedDataPack) === 'number'
            ? getPriceForPack(selectedOperator, selectedDataPack)
            : 0;
        let monthly = basePrice * quantity;
        let oneTime = 0;

        selectedServices.forEach(service => {
            const serviceInfo = additionalServices.find(s => s.id === service);
            if (serviceInfo) {
                monthly += serviceInfo.monthlyPrice * quantity;
                if (serviceInfo.oneTimePrice) {
                    oneTime += serviceInfo.oneTimePrice;
                }
            }
        });

        return {monthly, oneTime};
    };

    // const totals = calculateTotal();
    useEffect(() => {
        // Викликати calculateTotal кожного разу, коли змінюються залежності
        const newTotals = calculateTotal();
        setTotals(newTotals);
    }, [selectedOperator, selectedDataPack, quantity, selectedServices]);

    const isAnyServiceSelected = Object.values(selectedDataPack).some(
        (isSelected) => isSelected
    );

    const saveOfferToAirtable = async (offer) => {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}`;

        // const selectedServiceNames = selectedServices.map(serviceId => {
        //   const service = additionalServices.find(s => s.id === serviceId);
        //   return service?.name;
        // });
        console.log(offer.additionalServices);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fields: {
                        Operator: offer.operator,
                        DataPack: offer.dataPack,
                        Quantity: offer.quantity,
                        AdditionalServices: offer.additionalServices,
                        Monthly: parseFloat(offer.monthly),
                        OneTime: parseFloat(offer.oneTime),
                    },
                }),
            });

            if (response.ok) {
                console.log('Offer saved to Airtable!');
                setSavedOffers([...savedOffers, offer]);
                setOfferSavedMessage(true);

                // setIsButtonDisabled(true);

                setTimeout(() => {
                    setOfferSavedMessage(false);
                }, 2000);
            } else {
                console.error('Failed to save offer:', await response.text());
            }
        } catch (error) {
            console.error('Error saving offer to Airtable:', error);
        }
    };

    const saveOffer = () => {
        const total = calculateTotal();
        const offer = {
            operator: operators.find(op => op.id === selectedOperator)?.name || 'N/A',
            dataPack: dataPacks.find(pack => pack.id === selectedDataPack)?.display || 'N/A',
            quantity,
            additionalServices: selectedServices
                .map(serviceId => additionalServices.find(s => s.id === serviceId)?.name)
                .join(", "),
            monthly: total.monthly.toFixed(2),
            oneTime: total.oneTime.toFixed(2),
        };

        // Збереження на Airtable
        saveOfferToAirtable(offer);
        setIsOfferSaved(true);
    };


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Tjenesteoversikt</CardTitle>
                </CardHeader>

                <CardContent>
                    {/* <div>
  <h3>Debug: Additional Services</h3>
  <pre>{JSON.stringify(prices, null, 2)}</pre>
    </div> */}
                    <div className="">
                        <div className="operator-section">
                            <h2 className="heading-h4">Operatør</h2>
                            <div className="operator_buttons-container">
                                {operators.map((op) => (
                                    <button
                                        key={op.id}
                                        onClick={() => setSelectedOperator(op.id)}
                                        className={`button-custom font-small ${
                                            selectedOperator === op.id ? 'selected' : 'default'
                                        }`}
                                    >
                                        {op.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="datapack_wrap">
                            <h2 className="mb-2 heading-h4">Datapakke</h2>
                            <div className="datapack_items_container">
                                {/* Поле Antall у вигляді кнопки */}
                                <div className="datapack_raw_container">
                                    <label className="datapack_raw_header heading-h6">Antall:</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="datapack-input font-small"
                                    />
                                    <div className="datapack_buttons_container">
                                        {dataPacks.map((pack) => (
                                            <button
                                                key={pack.id}
                                                onClick={() => setSelectedDataPack(pack.id)}
                                                className={`button-custom font-small ${
                                                    selectedDataPack === pack.id
                                                        ? 'selected' : 'default'
                                                }`}
                                            >
                                                {pack.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>


                            </div>
                        </div>

                        <div className="services-container">
                            <h4 className="services-header heading-h6">Tilleggstjenester</h4>
                            <div className="services-item-box">
                            {additionalServices.map((service) => (
                                <div className="services-item-wrap">
                                <div
                                    key={service.id}
                                    className="services-item"
                                >
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        id={`service-${service.id}`}
                                        className="service-checkbox"
                                        checked={selectedServices.includes(service.id)}
                                        onChange={() => {
                                            if (selectedServices.includes(service.id)) {
                                                setSelectedServices((prev) =>
                                                    prev.filter((id) => id !== service.id)
                                                );
                                            } else {
                                                setSelectedServices((prev) => [...prev, service.id]);
                                            }
                                        }}
                                    />

                                    {/* Service Information */}
                                    <div className="flex-1 select-none">
                                        <label htmlFor={`service-${service.id}`} className="block cursor-pointer transition-opacity">
                                            <h5 className="mb-2 heading-h6">{service.name}</h5>
                                            <p className="font-small opacity-60">{service.description}</p>
                                            {/*{service.features?.length > 0 && (*/}
                                            {/*    <ul className="list-disc list-inside mt-2 text-sm text-gray-500">*/}
                                            {/*        {service.features.map((feature, index) => (*/}
                                            {/*            <li key={index}>{feature}</li>*/}
                                            {/*        ))}*/}
                                            {/*    </ul>*/}
                                            {/*)}*/}
                                        </label>
                                    </div>
                                    </div>



                                    {/* Price Section */}
                                    <p className="heading-h6 services-item-price">
                                        Kr {service.monthlyPrice.toFixed(2)}/md
                                        {/*{service.oneTimePrice && (*/}
                                        {/*    <p className="text-sm text-gray-500">*/}
                                        {/*        Engangssum: kr {service.oneTimePrice.toFixed(2)}*/}
                                        {/*    </p>*/}
                                        {/*)}*/}
                                    </p>
                                </div>
                            ))}
                            </div>
                        </div>



                    </div>
                    {/* <div> */}
                    {isAnyServiceSelected && (
                        <>
                        <div className="printable-section">

                            {/* Totalpris */}
                            <div className="totalpris-container">
                                <h3 className="totalpris-title">Totalpris</h3>
                                {typeof basePrice === "number" ? (
                                    <div className="totalpris-content">
                                        {totals.oneTime > 0 && (
                                            <div className="totalpris-row">
                                                <p className="totalpris-label">Engangssum</p>
                                                <p className="totalpris-value">kr {totals.oneTime.toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div className="totalpris-row">
                                            <p className="totalpris-label">Månedlig</p>
                                            <p className="totalpris-value">kr {totals.monthly.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="totalpris-placeholder">Kontakt oss for pristilbud</p>
                                )}




                            </div>
                            {/* Grunnpakke */}
                            {selectedOperator && selectedDataPack && (
                                <div className="grunnpakke-card">
                                    <div className="grunnpakke-content">
                                        <p className="grunnpakke-operator">
                                            {operators.find(op => op.id === selectedOperator).name}
                                        </p>
                                        <p className="grunnpakke-datapack">
                                            {operators.find(op => op.id === selectedOperator).description}
                                        </p>
                                        <div className="grunnpakke-row">
                                            {/* Кількість */}
                                            <p className="grunnpakke-quantity">{dataPacks.find(pack => pack.id === selectedDataPack).display} (Antall {quantity})</p>

                                            {/* Ціна за одиницю */}
                                            <p className="grunnpakke-price">
                                                {typeof basePrice === 'number' ? `kr ${basePrice.toFixed(2)}` : basePrice}/per
                                                enhet
                                            </p>
                                            <p className="grunnpakke-total">
                                                {typeof basePrice === 'number' ? `kr ${basePrice.toFixed(2) * quantity}` : basePrice}
                                            </p>
                                        </div>
                                    </div>


                                </div>
                            )}
                            {/* Tilleggstjenester */}
                            {selectedServices.length > 0 && (
                                <div className="additional-services">
                                    {selectedServices.map((serviceId) => {
                                        const service = additionalServices.find((s) => s.id === serviceId);
                                        return (
                                            <div key={serviceId} className="service-card">
                                                <div className="service-content">
                                                    <div className="service-info">
                                                        <h5 className="service-title">{service.name}</h5>
                                                        <p className="service-description">{service.description}</p>
                                                        {service.features?.length > 0 && (
                                                            <div className="service-features">
                                                                <p className="features-title">Inkluderer:</p>
                                                                <ul className="features-list">
                                                                    {service.features.map((feature, index) => (
                                                                        <li key={index}
                                                                            className="feature-item">{feature}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="service-prices">
                                                        {service.oneTimePrice > 0 && (
                                                            <p className="price-onetime">
                                                                Engangssum: <span>kr {service.oneTimePrice.toFixed(2)}</span>
                                                            </p>
                                                        )}
                                                        <p className="price-monthly">
                                                            Månedlig: <span>kr {service.monthlyPrice.toFixed(2)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                                                            {/* Success message */}
                                {offerSavedMessage && (
                                    <div className="totalpris-success-message">Offer Saved to Airtables!</div>
                                )}
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <div className="buttons-container">
                <button
                    onClick={saveOffer}
                    className={`active-button ${!isAnyServiceSelected ? 'disabled-button' : ''}`}
                    disabled={isOfferSaved}
                >
                    Save an offer
                </button>

                <button
                    onClick={() => window.print()}
                    className={`active-button ${!isOfferSaved ? 'disabled-button' : ''}`}
                    disabled={!isOfferSaved}
                >
                    Save as PDF
                    <svg className="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4"/></svg>
                </button>
            </div>
            <Total>
                {/*<TotalHeader></TotalHeader>*/}

            </Total>

        </>
    );
};

export default ServiceConfigurator;
