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

        setErro("");

        // =========================
       

        // =========================
        // CARREGA JSON LOCAL
        // =========================

        const response =
          await fetch(
            "/dados_aeronaves.json"
          );

        if (!response.ok) {

          throw new Error(
            "Erro ao carregar dados_aeronaves.json"
          );
        }

        const json =
          await response.json();

        console.log(
          "JSON carregado:",
          json
        );

        // =========================
        // IDENTIFICA LISTA
        // =========================

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
            "Estrutura JSON inválida"
          );
        }

        // =========================
        // INDEXA POR PREFIXO
        // =========================

        const mapa = {};

        lista.forEach(
          (item) => {

            const prefixo =
              String(
                item.MARCA ||
                ""
              )
                .replace("-", "")
                .trim()
                .toUpperCase();

            if (prefixo) {

              mapa[prefixo] =
                item;
            }
          }
        );

        console.log(
          "Aeronaves indexadas:",
          Object.keys(mapa)
            .length
        );

        // =========================
        // SALVA CACHE
        // =========================

       
        setBase(mapa);

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

  const formatValue =
  (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "Não informado";
    }

    // objeto normal
    if (
      typeof value ===
      "object"
    ) {

      return JSON.stringify(
        value,
        null,
        2
      );
    }

    let text =
      String(value);

    // limpa JSON quebrado da ANAC
    if (
      text.includes(
        '/""'
      ) ||
      text.includes(
        '""/'
      )
    ) {

      try {

        let cleaned =
          text
            .replaceAll(
              '/""',
              '"'
            )
            .replaceAll(
              '""/',
              '"'
            )
            .replaceAll(
              '/"',
              '"'
            )
            .replaceAll(
              '"/',
              '"'
            )
            .replaceAll(
              '١',
              ''
            );

        const parsed =
          JSON.parse(
            cleaned
          );

        return JSON.stringify(
          parsed,
          null,
          2
        );

      } catch {

        return text;
      }
    }

    return text;
  };

const renderValue =
  (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return (
        <span>
          Não informado
        </span>
      );
    }

    let text =
      String(value);

    // tenta limpar JSON quebrado
    if (
      text.includes('/""') ||
      text.includes('""/')
    ) {

      try {

        let cleaned =
          text
            .replaceAll('/""', '"')
            .replaceAll('""/', '"')
            .replaceAll('/"', '"')
            .replaceAll('"/', '"')
            .replaceAll('١', '');

        const parsed =
          JSON.parse(cleaned);

        value = parsed;

      } catch {}
    }

    // array
    if (
      Array.isArray(value)
    ) {

      return (

        <div className="space-y-3">

          {value.map(
            (item, index) => (

              <div
                key={index}
                className="bg-zinc-950 border border-zinc-800 rounded-xl p-3"
              >

                {typeof item ===
                "object" ? (

                  Object.entries(item)
                    .map(
                      ([k, v]) => (

                        <div
                          key={k}
                          className="mb-1"
                        >

                          <span className="text-zinc-400">
                            {k}:
                          </span>{" "}

                          <span>
                            {String(v)}
                          </span>

                        </div>

                      )
                    )

                ) : (

                  <div>
                    {String(item)}
                  </div>

                )}

              </div>

            )
          )}

        </div>
      );
    }

    // objeto
    if (
      typeof value ===
      "object"
    ) {

      return (

        <div className="space-y-2">

          {Object.entries(value)
            .map(
              ([k, v]) => (

                <div key={k}>

                  <span className="text-zinc-400">
                    {k}:
                  </span>{" "}

                  <span>
                    {String(v)}
                  </span>

                </div>

              )
            )}

        </div>
      );
    }

    return (
      <span>
        {String(value)}
      </span>
    );
  };
  return (


    <div className="min-h-screen bg-zinc-950 text-white p-6">

      <div className="max-w-7xl mx-auto">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

          {/* HEADER */}

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
                className="bg-zinc-950 border border-zinc-700 px-4 py-3 rounded-xl outline-none w-40"
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

          {/* ERRO */}

          {erro && (

            <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
              {erro}
            </div>

          )}

          {/* RESULTADO */}

          {data && (
            <>

              {/* RESUMO */}

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {Object.entries(data)
                  .slice(0, 8)
                  .map(
                    ([key, value]) => (

                      <Card
                        key={key}
                        title={key}
                        value={formatValue(value)}
                      />

                    )
                  )}

              </div>

              {/* AÇÕES */}

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

              {/* DADOS */}

              <div className="mt-8">

                <h2 className="text-2xl font-bold mb-5">
                  Dados completos
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

{Object.entries(data)
  .filter(
    ([key]) =>
      key !==
        "PROPRIETARIOSJSON" &&
      key !==
        "OPERADORESJSON"
  )
  .map(
    ([key, value]) => (

      <div
        key={key}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
      >

        <div className="text-zinc-400 text-sm mb-2">
          {key}
        </div>

        {renderValue(value)}

      </div>

    )
  )}

                </div>

              </div>

              {/* JSON */}

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
        {value}
      </div>

    </div>
  );
}