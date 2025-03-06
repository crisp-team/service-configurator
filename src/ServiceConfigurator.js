import React, { useState, useEffect, useMemo } from "react";
// import { ChevronDown, ChevronRight, X, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./components/ui/card/Card";
import { Total /*, TotalContent, TotalHeader*/ } from "./components/ui/card/Total";

import axios from "axios";
// import {Alert, AlertTitle, AlertDescription} from './components/ui/alert';
import { PrintFooter } from "./components/PrintFooter";
import { LoaderComponent } from "./components/loader/LoaderComponent";

const ServiceConfigurator = () => {
  const AIRTABLE_API_KEY =
    "patAT0AzbWvWGLxKD.09d9751652548c278295aa70da9ab4134b09133e0805628a7b6ead59545aec24";
  const AIRTABLE_BASE_ID = "appP8qFKtTcwB3TFK"; //
  const TABLE_NAME = "Offers";

  const [savedOffers, setSavedOffers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [dataPacks, setDataPacks] = useState([]);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [prices, setPrices] = useState({});
  const [selectedOperator, setSelectedOperator] = useState("");
  const [selectedDataPack, setSelectedDataPack] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [offerSavedMessage, setOfferSavedMessage] = useState(false);
  const [totals, setTotals] = useState({ monthly: 0, oneTime: 0 });
  const [isOfferSaved, setIsOfferSaved] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataPackSorted, setDataPackSorted] = useState([]);

  useEffect(() => {
    const fetchAirtableData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        };

        const operatorsResponse = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/operators`,
          { headers }
        );
        const dataPacksResponse = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/dataPacks`,
          { headers }
        );
        const additionalServicesResponse = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/additionalServices`,
          { headers }
        );
        const pricesResponse = await axios.get(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/prices`,
          { headers }
        );

        if (dataPacksResponse?.data?.records) {
          setDataPacks(
            dataPacksResponse.data.records.map((record) => ({
              id: record.fields.id,
              size: record.fields.size,
              display: record.fields.display,
              order: record.fields.order
            }))
          );
        } else {
          console.warn("No records found in the API response");
          setDataPacks([]);
        }

        setOperators(
          operatorsResponse.data.records.map((record) => ({
            id: record.fields.id,
            name: record.fields.name,
            description: record.fields.description,
          }))
        );

        // setDataPacks(dataPacksResponse.data.records.map(record => ({
        //   id: record.fields.id,
        //   size: record.fields.size,
        //   display: record.fields.display,
        // })));

        setAdditionalServices(
          additionalServicesResponse.data.records.map((record) => ({
            id: record.fields.id,
            name: record.fields.name,
            description: record.fields.description,
            monthlyPrice: record.fields.monthlyPrice,
            oneTimePrice: record.fields.oneTimePrice,
            features: record.fields.features,
          }))
        );

        const formattedPrices = pricesResponse.data.records.reduce(
          (acc, record) => {
            const { Operator, DataPack, Price } = record.fields;

            if (!acc[Operator]) {
              acc[Operator] = {};
            }
            acc[Operator][DataPack] = Price || "Ved forespørsel"; // Default to 'Ved forespørsel' if Price is missing
            return acc;
          },
          {}
        );

        setPrices(formattedPrices); // Update state with formatted prices

        setTimeout(()=>{
          setIsLoaded(true);
        },1000);
      } catch (error) {
        console.error("Error fetching Airtable data:", error);
      }
    };

    fetchAirtableData();
  }, []);

  const getPriceForPack = (operator, pack) => {
    return prices[operator]?.[pack] || "Ved forespørsel";
  };

  const basePrice =
    typeof getPriceForPack(selectedOperator, selectedDataPack) === "number"
      ? getPriceForPack(selectedOperator, selectedDataPack)
      : 0;

  const calculateTotal = () => {
    const basePrice =
      typeof getPriceForPack(selectedOperator, selectedDataPack) === "number"
        ? getPriceForPack(selectedOperator, selectedDataPack)
        : 0;
    let monthly = basePrice * quantity;
    let oneTime = 0;

    selectedServices.forEach((service) => {
      const serviceInfo = additionalServices.find((s) => s.id === service);
      if (serviceInfo) {
        monthly += serviceInfo.monthlyPrice * quantity;
        if (serviceInfo.oneTimePrice) {
          oneTime += serviceInfo.oneTimePrice;
        }
      }
    });

    return { monthly, oneTime };
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
    // console.log(offer.additionalServices);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
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
        // console.log("Offer saved to Airtable!");
        setSavedOffers([...savedOffers, offer]);
        setOfferSavedMessage(true);

        // setIsButtonDisabled(true);

        setTimeout(() => {
          setOfferSavedMessage(false);
        }, 2000);
      } else {
        console.error("Failed to save offer:", await response.text());
      }
    } catch (error) {
      console.error("Error saving offer to Airtable:", error);
    }
  };

  const saveOffer = () => {
    const total = calculateTotal();
    const offer = {
      operator:
        operators.find((op) => op.id === selectedOperator)?.name || "N/A",
      dataPack:
        dataPacks.find((pack) => pack.id === selectedDataPack)?.display ||
        "N/A",
      quantity,
      additionalServices: selectedServices
        .map(
          (serviceId) =>
            additionalServices.find((s) => s.id === serviceId)?.name
        )
        .join(", "),
      monthly: total.monthly.toFixed(2),
      oneTime: total.oneTime.toFixed(2),
    };

    // Збереження на Airtable
    saveOfferToAirtable(offer);
    setIsOfferSaved(true);

    setTimeout(()=>{
      typeof window !== 'undefined' && window.scrollTo(0, 0);
    },200)

  };

  useEffect(() => {
    const print = (e) => {
      if (e.data === 'print') {
        window.print();
      }
    }

    typeof window !== 'undefined' && window.addEventListener('message', print);

    return () => {
      typeof window !== 'undefined' && window.removeEventListener('message', print);
    };
  }, []);


  useMemo(()=> setDataPackSorted(dataPacks?.sort((a, b) => a.order - b.order)),[dataPacks]);
  

  return (
    <div className={`wrapper relative${isLoaded ? '' : ' is-loading'}`}>
      { isLoaded ? <></> : <LoaderComponent />}
      <Card>
        <CardHeader>
          <CardTitle>M2M Tjenesteoversikt</CardTitle>
        </CardHeader>
        {!isOfferSaved && (
          <>
            <CardContent>
              {/* <div>
                <h3>Debug: Additional Services</h3>
                <pre>{JSON.stringify(prices, null, 2)}</pre>
              </div> */}
              <div>
                <div className="mb-10 flex flex-col items-start gap-6 self-stretch">
                  <h2 className="heading-h4">Operatør</h2>
                  <div className="flex gap-3 flex-wrap justify-between w-full">
                    {operators.map((op) => (
                      <button
                        key={op.id}
                        onClick={() => setSelectedOperator(op.id)}
                        className={`button-custom font-small ${
                          selectedOperator === op.id ? "selected" : "default"
                        }`}
                      >
                        {op.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="mb-2 heading-h4">Datapakke</h2>
                  <div className="datapack_items_container">
                    {/* Поле Antall у вигляді кнопки */}
                    <div className="datapack_raw_container">
                      <label className="datapack_raw_header heading-h6">
                        Antall:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="datapack-input font-small"
                      />
                      <div className="datapack_buttons_container">
                        {dataPackSorted?.map((pack) => {
                          return(
                          <button
                            key={pack.id}
                            onClick={() => setSelectedDataPack(pack.id)}
                            className={`button-custom font-small ${
                              selectedDataPack === pack.id
                                ? "selected"
                                : "default"
                            }`}
                          >
                            {pack.size}
                          </button>
                        )})}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="services-container">
                  <h4 className="services-header heading-h4">
                    Tilleggstjenester
                  </h4>
                  <div className="services-item-box">
                    {additionalServices.map((service,idx) => {
                      return (
                      <div className="services-item-wrap" key={idx}>
                        <div key={service.id} className="services-item">
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
                                setSelectedServices((prev) => [
                                  ...prev,
                                  service.id,
                                ]);
                              }
                            }}
                          />

                          {/* Service Information */}
                          <div className="flex-1 select-none">
                            <label
                              htmlFor={`service-${service.id}`}
                              className="block cursor-pointer transition-opacity"
                            >
                              <h5 className="mb-2 heading-h6">
                                {service.name}
                              </h5>
                              <p className="font-small opacity-60">
                                {service.description}
                              </p>
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
                        <div className="heading-h6 services-item-price">
                          <p>
                            {service?.monthlyPrice ? (
                            `Kr ${service?.monthlyPrice?.toFixed(2)}/mnd`
                            ) : <>-</>}
                          </p>

                          <p className="pt-1 sm:pt-1.5 text-sm text-gray-500">
                            {service?.oneTimePrice ? (
                          `Kr ${service?.oneTimePrice?.toFixed(2)}/eng.s`
                          ) : <>-</>} 
                          </p>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              </div>
              {/* <div> */}
            </CardContent>
          </>
        )}

        {isAnyServiceSelected && (
          <div className={isOfferSaved ? 'printable-section-wrap p-6 sm:p-8 bg-white rounded-[10px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.25)]' : ''}>
            <div className="sm:px-6">
              {/* Totalpris */}
              <div className="totalpris-container sm:-mx-6 mb-4 p-4 sm:p-6 flex justify-between gap-2.5 rounded-[20px] bg-dark-bg">
                <h3 className="totalpris-title heading-h4 text-custom-secondary-dark">
                  Totalpris
                </h3>
                {typeof basePrice === "number" ? (
                  <div className="totalpris-content">
                    {totals.oneTime > 0 && (
                      <div className="totalpris-row">
                        <p className="totalpris-label">Engangssum</p>
                        <p className="totalpris-price">
                          kr {totals.oneTime.toFixed(2)}
                        </p>
                      </div>
                    )}
                    <div className="totalpris-row">
                      <p className="totalpris-label">Månedlig</p>
                      <p className="totalpris-price">
                        kr {totals?.monthly?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="font-small text-[#6b7280]">
                    Kontakt oss for pristilbud
                  </p>
                )}
              </div>
              {/* Grunnpakke */}
              {selectedOperator && selectedDataPack && (
                <div className="py-6 flex flex-col sm:flex-row justify-between gap-2 sm:gap-10 border-b border-b-dark-bg">
                  <div className="grunnpakke-content">
                    <p className="font-regular text-custom-secondary-dark font-bold">
                      {operators.find((op) => op.id === selectedOperator).name}
                    </p>
                    <p className="grunnpakke-datapack text-custom-secondary-dark font-small font-medium">
                      {
                        operators.find((op) => op.id === selectedOperator)
                          .description
                      }
                    </p>
                    <div className="flex gap-2 flex-wrap items-center">
                      {/* Кількість */}
                      <p className="font-small text-custom-secondary-dark font-medium">
                        {
                          dataPacks.find((pack) => pack.id === selectedDataPack)
                            .display
                        }{" "}
                        (Antall {quantity} {})
                      </p>

                      {/* Ціна за одиницю */}
                      <p className="font-small text-custom-secondary-dark font-bold">
                        {typeof basePrice === "number"
                          ? `kr ${basePrice.toFixed(2)}`
                          : basePrice}
                        /per enhet
                      </p>
                      
                    </div>
                  </div>

                  <div className="totalpris-content">
                    <div className="totalpris-row">
                      <p className="totalpris-label">Antall:</p>
                      <p className="totalpris-price">
                          {typeof basePrice === "number"
                            ? `kr ${basePrice.toFixed(2) * quantity}`
                            : basePrice}
                        </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Tilleggstjenester */}
              {selectedServices.length > 0 && (
                <div className="text-custom-secondary-dark font-small font-medium flex flex-col flex-wrap md:flex-nowrap">
                  {selectedServices.map((serviceId) => {
                    const service = additionalServices.find(
                      (s) => s.id === serviceId
                    );
                    return (
                      <div key={serviceId} className="py-6 flex flex-col border-b border-b-dark-bg">
                        <div className="flex justify-between flex-col md:flex-row gap-6 md:items-start">
                          <div className="service-info">
                            <h5 className="font-regular font-bold">
                              {service.name}
                            </h5>
                            <p className="mt-2 sm:mt-4">
                              {service.description}
                            </p>
                            {service.features?.length > 0 && (
                              <div className="mt-2">
                                <p className="font-small">Inkluderer:</p>

                                <ul className="mt-2 flex flex-col pl-5 gap-2 list-disc">
                                  {service.features.map((feature, index) => (
                                    <li key={index} className="marker:text-custom-primary">
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="totalpris-content">
                            {service.oneTimePrice > 0 && (
                              <div className="totalpris-row">
                                <p className="totalpris-label">Engangssum:</p>
                                <p className="totalpris-price">
                                  kr {service?.oneTimePrice ? service.oneTimePrice.toFixed(2) : <>-</>}
                                </p>
                              </div>
                            )}
                            <div className="totalpris-row">
                              <p className="totalpris-label">Månedlig:</p>
                              <p className="totalpris-price">
                                kr {service?.monthlyPrice ? service?.monthlyPrice.toFixed(2) : <>-</>}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Success message */}
              {/* {offerSavedMessage && (
                <div className="totalpris-success-message">
                  Offer Saved to Airtables!
                </div>
              )} */}
            </div>

            {isOfferSaved && <PrintFooter/>}
          </div>
        )}

        <div className="buttons-container">
          <button
            onClick={saveOffer}
            className={`active-button ${
              !isAnyServiceSelected || isOfferSaved ? "disabled-button" : ""
            }`}
            disabled={isOfferSaved}
          >
            {isOfferSaved ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  fill="none"
                  viewBox="0 0 25 25"
                >
                  <path
                    fill="#161718"
                    d="M10.568 18.269a.87.87 0 0 1-.595.231.87.87 0 0 1-.596-.231L4.62 13.813a1.13 1.13 0 0 1 0-1.674l.596-.558a1.324 1.324 0 0 1 1.787 0l2.97 2.782 8.024-7.516a1.324 1.324 0 0 1 1.787 0l.596.558a1.13 1.13 0 0 1 0 1.673l-9.812 9.19Z"
                    opacity=".3"
                  />
                </svg>Offer saved
              </>
            ) : (
              "Save an offer"
            )}
          </button>

          <button
            onClick={() => window.print()}
            className={`active-button ${
              !isOfferSaved ? "disabled-button" : ""
            }`}
            disabled={!isOfferSaved}
          >
            Save as PDF
            <svg
              className="pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>
      </Card>

      <Total>{/*<TotalHeader></TotalHeader>*/}</Total>
    </div>
  );
};

export default ServiceConfigurator;
