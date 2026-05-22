import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

export default function App() {

  const [prefixo, setPrefixo] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [data, setData] =
    useState(null);

  const [base, setBase] =
    useState({});

  const [showJson, setShowJson] =
    useState(false);

  useEffect(() => {
    carregarBase();
  }, []);

  const carregarBase =
    async () => {

      try {

        setLoading(true);

        // cache
        const cache =
          localStorage.getItem(
            "anac_db"
          );

        const cacheTime =
          localStorage.getItem(
            "anac_db_time"
          );

        // 24 horas
        const limite =
          1000 *
          60 *
          60 *
          24;

        // usa cache
        if (
          cache &&
          cacheTime
        ) {

          const agora =
            Date.now();

          const diff =
            agora -
            Number(cacheTime);

          if (
            diff < limite
          ) {

            const parsed =
              JSON.parse(cache);

            setBase(parsed);

            console.log(
              "Cache carregado"
            );

            setLoading(false);

            return;
          }
        }

        console.log(
          "Baixando base ANAC..."
        );

        const response =
  await fetch(
    "https://corsproxy.io/?https://sistemas.anac.gov.br/dadosabertos/Aeronaves/RAB/dados_aeronaves.json"
  );
        if (!response.ok) {

          throw new Error(
            "Erro ao baixar base"
          );
        }

        const json =
          await response.json();

        let lista = [];

        if (
          Array.isArray(json)
        ) {

          lista = json;

        } else if (
          Array.isArray(
            json.data
          )
        ) {

          lista = json.data;

        } else {

          throw new Error(
            "Estrutura inválida"
          );
        }

        // indexa por prefixo
        const mapa = {};

        lista.forEach(
          (item) => {

            const marca =
              String(
                item.MARCA || ""
              )
                .replace("-", "")
                .trim()
                .toUpperCase();

            if (marca) {

              mapa[marca] =
                item;
            }
          }
        );

        // salva cache
        localStorage.setItem(
          "anac_db",
          JSON.stringify(mapa)
        );

        localStorage.setItem(
          "anac_db_time",
          Date.now()
        );

        setBase(mapa);

        console.log(
          "Base carregada:",
          Object.keys(mapa)
            .length
        );

        setLoading(false);

      } catch (err) {

        console.error(err);

        setErro(
          err.message
        );

        setLoading(false);
      }
    };

  const consultar = () => {

    try {

      setErro("");

      setData(null);

      const busca =
        prefixo
          .replace("-", "")
          .trim()
          .toUpperCase();

      if (!busca) {

        throw new Error(
          "Digite um prefixo"
        );
      }

      const aeronave =
        base[busca];

      if (!aeronave) {

        throw new Error(
          "Aeronave não encontrada"
        );
      }

      setData(aeronave);

    } catch (err) {

      setErro(
        err.message
      );
    }
  };

  const normalizePrefix =
    (value) => {

      let clean =
        value
          .toUpperCase()
          .replace(
            /[^A-Z0-9]/g,
            ""
          );

      if (
        clean.length > 2
      ) {

        clean =
          clean.slice(0, 2) +
          "-" +
          clean.slice(2);
      }

      return clean.slice(0, 6);
    };

  const filledFields =
    useMemo(() => {

      if (!data)
        return 0;

      return Object.values(
        data
      ).filter(
        (v) =>
          v !== null &&
          v !== undefined &&
          v !== ""
      ).length;

    }, [data]);

  const copyJson =
    async () => {

      await navigator.clipboard.writeText(
        JSON.stringify(
          data,
          null,
          2
        )
      );

      alert(
        "JSON copiado"
      );
    };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="max-w-7xl mx-auto">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

            <div>

              <h1 className="text-3xl font-bold">
                Consulta RAB
              </h1>

              <p className="text-zinc-400 mt-2">
                Consulta pública ANAC
              </p>

              <div className="mt-2 text-sm">

                {loading ? (

                  <span className="text-yellow-400">
                    Carregando base...
                  </span>

                ) : (

                  <span className="text-green-400">
                    Base carregada (
                    {
                      Object.keys(base)
                        .length
                    }{" "}
                    aeronaves)
                  </span>

                )}

              </div>

            </div>

            <div className="flex gap-3">

              <input
                type="text"
                placeholder="PP-ABC"
                value={prefixo}
                onChange={(e) =>
                  setPrefixo(
                    normalizePrefix(
                      e.target.value
                    )
                  )
                }
                className="bg-zinc-950 border border-zinc-700 px-4 py-3 rounded-xl outline-none"
              />

              <button
                onClick={consultar}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 py-3 rounded-xl"
              >
                Consultar
              </button>

            </div>

          </div>

          {erro && (

            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
              {erro}
            </div>

          )}

          {data && (
            <>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {Object.entries(data)
                  .slice(0, 8)
                  .map(
                    ([key, value]) => (

                      <Card
                        key={key}
                        title={key}
                        value={value}
                      />

                    )
                  )}

              </div>

              <div className="mt-6 flex gap-4 flex-wrap">

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

                  <div className="text-zinc-400 text-sm">
                    Campos preenchidos
                  </div>

                  <div className="text-4xl font-bold mt-2">
                    {filledFields}
                  </div>

                </div>

                <button
                  onClick={() =>
                    setShowJson(
                      !showJson
                    )
                  }
                  className="bg-zinc-800 hover:bg-zinc-700 px-5 py-3 rounded-xl"
                >
                  {showJson
                    ? "Ocultar JSON"
                    : "Ver JSON"}
                </button>

                <button
                  onClick={copyJson}
                  className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl"
                >
                  Copiar JSON
                </button>

              </div>

              <div className="mt-8">

                <h2 className="text-2xl font-bold mb-5">
                  Dados completos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {Object.entries(data).map(
                    ([key, value]) => (

                      <div
                        key={key}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
                      >

                        <div className="text-zinc-400 text-sm mb-2">
                          {key}
                        </div>

                        <div className="break-words text-sm">

                          {String(
                            value
                          ) || "Não informado"}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {showJson && (

                <div className="mt-8">

                  <pre className="bg-black border border-zinc-800 rounded-2xl p-6 overflow-auto text-green-400 text-sm">
                    {JSON.stringify(
                      data,
                      null,
                      2
                    )}
                  </pre>

                </div>

              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}

function Card({
  title,
  value,
}) {

  return (

    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

      <div className="text-sm text-zinc-400">
        {title}
      </div>

      <div className="mt-2 text-lg font-semibold break-words">

        {String(value) ||
          "Não informado"}

      </div>

    </div>
  );
}