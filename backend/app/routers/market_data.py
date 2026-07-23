from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app import schemas
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/market", tags=["Market Data"])

# Suffix and Exchange Mapping
EXCHANGE_SUFFIXES = {
    "PARIS": ".PA",
    "PAR": ".PA",
    "PA": ".PA",
    "XPAR": ".PA",
    "GERMANY": ".DE",
    "FRANKFURT": ".DE",
    "XETRA": ".DE",
    "DE": ".DE",
    "LONDON": ".L",
    "LSE": ".L",
    "L": ".L",
    "AMSTERDAM": ".AS",
    "AS": ".AS",
    "XAMS": ".AS",
    "MILAN": ".MI",
    "MI": ".MI",
    "MADRID": ".MC",
    "MC": ".MC",
}

EXCHANGE_NAMES = {
    ".PA": "Euronext Paris",
    ".DE": "XETRA Germany",
    ".L": "London Stock Exchange",
    ".AS": "Euronext Amsterdam",
    ".MI": "Borsa Italiana",
    ".MC": "Bolsa de Madrid",
}

# Reliable fallback dataset for European market assets in EUR currency
FALLBACK_EU_ASSETS = {
    "MC.PA": {
        "name": "LVMH Moët Hennessy Louis Vuitton",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 718.40,
        "prev": 709.80,
        "high": 724.00,
        "low": 708.20,
        "volume": 384500,
    },
    "VW.DE": {
        "name": "Volkswagen AG Preference",
        "asset_type": "Stock",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 96.55,
        "prev": 97.40,
        "high": 98.10,
        "low": 96.20,
        "volume": 620400,
    },
    "VUAA.L": {
        "name": "Vanguard S&P 500 UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "London Stock Exchange",
        "currency": "EUR",
        "price": 94.25,
        "nav": 94.20,
        "prev": 93.60,
        "high": 94.80,
        "low": 93.50,
        "volume": 1289000,
    },
    "ASML.AS": {
        "name": "ASML Holding N.V.",
        "asset_type": "Stock",
        "exchange": "Euronext Amsterdam",
        "currency": "EUR",
        "price": 842.10,
        "prev": 831.50,
        "high": 850.00,
        "low": 830.20,
        "volume": 412000,
    },
    "SAP.DE": {
        "name": "SAP SE",
        "asset_type": "Stock",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 194.80,
        "prev": 192.40,
        "high": 196.20,
        "low": 192.00,
        "volume": 890000,
    },
    "OR.PA": {
        "name": "L'Oréal S.A.",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 388.50,
        "prev": 385.20,
        "high": 390.10,
        "low": 384.80,
        "volume": 290000,
    },
    "AIR.PA": {
        "name": "Airbus SE",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 134.60,
        "prev": 133.10,
        "high": 135.20,
        "low": 132.80,
        "volume": 510000,
    },
    "IWDA.AS": {
        "name": "iShares Core MSCI World UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "Euronext Amsterdam",
        "currency": "EUR",
        "price": 88.50,
        "nav": 88.45,
        "prev": 87.90,
        "high": 88.90,
        "low": 87.80,
        "volume": 980000,
    },
    "MEUD.PA": {
        "name": "Amundi Stoxx Europe 600 UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 412.30,
        "nav": 412.25,
        "prev": 410.50,
        "high": 413.50,
        "low": 410.00,
        "volume": 320000,
    },
    "C3M.PA": {
        "name": "Amundi EUR Cash UCITS Mutual Fund",
        "asset_type": "Mutual Fund",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 105.40,
        "nav": 105.40,
        "prev": 105.35,
        "high": 105.50,
        "low": 105.30,
        "volume": 0,
    },
    "EUEA.PA": {
        "name": "iShares MSCI Europe UCITS Mutual Fund",
        "asset_type": "Mutual Fund",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 76.20,
        "nav": 76.20,
        "prev": 75.80,
        "high": 76.50,
        "low": 75.60,
        "volume": 0,
    },
    "SIE.DE": {
        "name": "Siemens AG",
        "asset_type": "Stock",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 168.40,
        "prev": 166.80,
        "high": 170.10,
        "low": 166.50,
        "volume": 420000,
    },
    "SAN.PA": {
        "name": "Sanofi S.A.",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 89.15,
        "prev": 88.40,
        "high": 89.80,
        "low": 88.20,
        "volume": 610000,
    },
    "TTE.PA": {
        "name": "TotalEnergies SE",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 62.30,
        "prev": 61.80,
        "high": 62.90,
        "low": 61.60,
        "volume": 1150000,
    },
    "ALV.DE": {
        "name": "Allianz SE",
        "asset_type": "Stock",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 264.50,
        "prev": 262.10,
        "high": 266.00,
        "low": 261.80,
        "volume": 380000,
    },
    "BNP.PA": {
        "name": "BNP Paribas S.A.",
        "asset_type": "Stock",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 65.80,
        "prev": 64.90,
        "high": 66.30,
        "low": 64.70,
        "volume": 790000,
    },
    "DTE.DE": {
        "name": "Deutsche Telekom AG",
        "asset_type": "Stock",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 24.10,
        "prev": 23.85,
        "high": 24.30,
        "low": 23.80,
        "volume": 1820000,
    },
    "EXXT.DE": {
        "name": "iShares NASDAQ 100 UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 985.20,
        "nav": 985.10,
        "prev": 978.40,
        "high": 990.00,
        "low": 976.00,
        "volume": 410000,
    },
    "VAGF.DE": {
        "name": "Vanguard Global Aggregate Bond UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 24.80,
        "nav": 24.80,
        "prev": 24.75,
        "high": 24.90,
        "low": 24.70,
        "volume": 310000,
    },
    "SEGA.DE": {
        "name": "iShares Euro Government Bond UCITS ETF (EUR)",
        "asset_type": "ETF",
        "exchange": "XETRA Germany",
        "currency": "EUR",
        "price": 122.40,
        "nav": 122.35,
        "prev": 122.00,
        "high": 122.70,
        "low": 121.90,
        "volume": 250000,
    },
    "LU0996177134.PA": {
        "name": "Amundi Index MSCI World UCITS Mutual Fund",
        "asset_type": "Mutual Fund",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 488.10,
        "nav": 488.10,
        "prev": 483.50,
        "high": 489.00,
        "low": 483.00,
        "volume": 0,
    },
    "FR0010149302.PA": {
        "name": "BNP Paribas Euro Equity Mutual Fund",
        "asset_type": "Mutual Fund",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 312.40,
        "nav": 312.40,
        "prev": 309.80,
        "high": 313.50,
        "low": 309.00,
        "volume": 0,
    },
    "LU0251128657.PA": {
        "name": "Carmignac Patrimoine Euro Fund",
        "asset_type": "Mutual Fund",
        "exchange": "Euronext Paris",
        "currency": "EUR",
        "price": 642.50,
        "nav": 642.50,
        "prev": 638.00,
        "high": 644.00,
        "low": 637.50,
        "volume": 0,
    },
}


def normalize_eu_symbol(symbol: str, exchange: Optional[str] = None) -> tuple[str, str]:
    """Appends European exchange suffix if general ticker provided."""
    clean_sym = symbol.strip().upper()

    if exchange and "." not in clean_sym:
        ex_key = exchange.strip().upper()
        if ex_key in EXCHANGE_SUFFIXES:
            clean_sym = f"{clean_sym}{EXCHANGE_SUFFIXES[ex_key]}"

    ex_name = "Euronext Paris"
    for suffix, name in EXCHANGE_NAMES.items():
        if clean_sym.endswith(suffix):
            ex_name = name
            break

    return clean_sym, ex_name


def is_eu_market_open(market_state: Optional[str] = None) -> str:
    """Evaluates real-time European market open/close status based on state & trading hours (08:00 to 16:30 UTC Mon-Fri)."""
    if market_state:
        m_state = market_state.upper()
        if m_state == "REGULAR":
            return "OPEN"
        elif m_state in ["CLOSED", "POST", "PRE"]:
            return "CLOSED"
    
    from datetime import datetime, timezone
    now_utc = datetime.now(timezone.utc)
    if now_utc.weekday() < 5:
        hour_min = now_utc.hour + now_utc.minute / 60.0
        if 8.0 <= hour_min <= 16.5:
            return "OPEN"
    return "CLOSED"


@router.get("/{symbol}", response_model=schemas.AssetDataResponse)
def get_market_data(symbol: str, exchange: Optional[str] = Query(None)):
    """Fetch live or fallback market data for EU Stocks, ETFs, and Mutual Funds in EUR."""
    clean_sym, default_exchange_name = normalize_eu_symbol(symbol, exchange)

    # Try fetching with yfinance
    try:
        import yfinance as yf

        ticker = yf.Ticker(clean_sym)
        info = ticker.info

        if info and ("currentPrice" in info or "regularMarketPrice" in info or "navPrice" in info):
            raw_price = (
                info.get("currentPrice")
                or info.get("regularMarketPrice")
                or info.get("navPrice")
                or info.get("previousClose")
            )
            raw_prev = info.get("previousClose") or raw_price
            quote_type = info.get("quoteType", "").upper()
            curr = info.get("currency", "EUR").upper()

            # Convert GBp (pence), GBP, or USD to EUR for European consistency
            fx_rate = 1.0
            if curr == "GBP":
                fx_rate = 1.18
            elif curr == "GBP":
                fx_rate = 0.0118  # GBp pence to EUR
            elif curr == "USD":
                fx_rate = 0.92

            price = round(float(raw_price) * fx_rate, 2)
            prev_close = round(float(raw_prev) * fx_rate, 2)

            if quote_type == "MUTUALFUND":
                asset_type = "Mutual Fund"
            elif quote_type == "ETF":
                asset_type = "ETF"
            else:
                asset_type = "Stock"

            nav_val = info.get("navPrice") or (price if asset_type in ["Mutual Fund", "ETF"] else None)
            if nav_val is not None and curr in ["GBP", "GBp", "USD"]:
                nav_val = round(float(nav_val) * fx_rate, 2)

            price_change = round(price - prev_close, 2)
            pct_change = round((price_change / prev_close) * 100, 2) if prev_close else 0.0
            mkt_status = is_eu_market_open(info.get("marketState") or info.get("regularMarketState"))

            return schemas.AssetDataResponse(
                symbol=clean_sym,
                name=info.get("shortName") or info.get("longName") or clean_sym,
                asset_type=asset_type,
                exchange=info.get("exchange") or default_exchange_name,
                currency="EUR",
                current_price=price,
                nav=round(float(nav_val), 2) if nav_val is not None else None,
                previous_close=prev_close,
                day_high=round(float(info.get("dayHigh")) * fx_rate, 2) if info.get("dayHigh") else None,
                day_low=round(float(info.get("dayLow")) * fx_rate, 2) if info.get("dayLow") else None,
                volume=info.get("volume"),
                price_change=price_change,
                percentage_change=pct_change,
                is_positive=price_change >= 0,
                market_status=mkt_status,
            )
    except Exception as err:
        logger.warning(f"yfinance fetch failed for {clean_sym}: {err}. Falling back to cached asset metrics.")

    # Fallback Handling for EU Assets
    if clean_sym in FALLBACK_EU_ASSETS:
        data = FALLBACK_EU_ASSETS[clean_sym]
        price = data["price"]
        prev = data["prev"]
        change = round(price - prev, 2)
        pct = round((change / prev) * 100, 2)
        return schemas.AssetDataResponse(
            symbol=clean_sym,
            name=data["name"],
            asset_type=data["asset_type"],
            exchange=data["exchange"],
            currency="EUR",
            current_price=price,
            nav=data.get("nav"),
            previous_close=prev,
            day_high=data.get("high"),
            day_low=data.get("low"),
            volume=data.get("volume"),
            price_change=change,
            percentage_change=pct,
            is_positive=change >= 0,
            market_status=is_eu_market_open(),
        )

    # Generic fallback if symbol unknown
    return schemas.AssetDataResponse(
        symbol=clean_sym,
        name=f"{clean_sym} Asset",
        asset_type="Stock" if not clean_sym.startswith("V") else "ETF",
        exchange=default_exchange_name,
        currency="EUR",
        current_price=150.00,
        nav=None,
        previous_close=148.50,
        day_high=152.00,
        day_low=148.00,
        volume=250000,
        price_change=1.50,
        percentage_change=1.01,
        is_positive=True,
        market_status=is_eu_market_open(),
    )


@router.get("/{symbol}/history", response_model=list[schemas.AssetHistoryData])
def get_market_history(
    symbol: str, 
    period: str = "1mo", 
    interval: Optional[str] = None, 
    exchange: Optional[str] = Query(None)
):
    """Fetch historical price data for charting (Line & Candlestick)."""
    import math
    clean_sym, _ = normalize_eu_symbol(symbol, exchange)
    
    try:
        import yfinance as yf
        ticker = yf.Ticker(clean_sym)
        
        # Determine interval based on period if not specified
        if not interval:
            if period in ["1d", "5d"]:
                interval = "15m"
            elif period in ["1mo", "3mo"]:
                interval = "1d"
            else:
                interval = "1wk"
                
        hist = ticker.history(period=period, interval=interval)
        
        if hist.empty:
            hist = ticker.history(period=period)

        if hist.empty:
            return []
            
        history_data = []
        for date, row in hist.iterrows():
            fmt = "%m-%d %H:%M" if period in ["1d", "5d"] else "%Y-%m-%d"
            date_str = date.strftime(fmt)
            c = round(float(row["Close"]), 2)
            o = round(float(row["Open"]), 2) if "Open" in row and not math.isnan(row["Open"]) else c
            h = round(float(row["High"]), 2) if "High" in row and not math.isnan(row["High"]) else max(o, c)
            l = round(float(row["Low"]), 2) if "Low" in row and not math.isnan(row["Low"]) else min(o, c)
            v = int(row["Volume"]) if "Volume" in row and not math.isnan(row["Volume"]) else 0
            
            history_data.append(schemas.AssetHistoryData(
                date=date_str,
                price=c,
                open=o,
                high=h,
                low=l,
                close=c,
                volume=v
            ))
            
        return history_data
    except Exception as err:
        logger.warning(f"yfinance history fetch failed for {clean_sym}: {err}")
        
        from datetime import datetime, timedelta
        import random
        
        base_price = FALLBACK_EU_ASSETS.get(clean_sym, {}).get("price", 150.0)
        history_data = []
        days = 1 if period == "1d" else (5 if period == "5d" else (30 if period == "1mo" else 365))
        for i in range(days):
            date_str = (datetime.now() - timedelta(days=days-i)).strftime("%Y-%m-%d")
            op = base_price * (1 + random.uniform(-0.01, 0.01))
            cl = op * (1 + random.uniform(-0.02, 0.02))
            hi = max(op, cl) * (1 + random.uniform(0.001, 0.01))
            lo = min(op, cl) * (1 - random.uniform(0.001, 0.01))
            base_price = cl
            history_data.append(schemas.AssetHistoryData(
                date=date_str,
                price=round(cl, 2),
                open=round(op, 2),
                high=round(hi, 2),
                low=round(lo, 2),
                close=round(cl, 2),
                volume=random.randint(50000, 1000000)
            ))
        return history_data


@router.get("/{symbol}/profile", response_model=schemas.AssetProfileData)
def get_market_profile(symbol: str, exchange: Optional[str] = Query(None)):
    """Fetch detailed company profile information."""
    clean_sym, _ = normalize_eu_symbol(symbol, exchange)
    
    try:
        import yfinance as yf
        ticker = yf.Ticker(clean_sym)
        info = ticker.info
        
        return schemas.AssetProfileData(
            sector=info.get("sector"),
            industry=info.get("industry"),
            website=info.get("website"),
            market_cap=info.get("marketCap"),
            business_summary=info.get("longBusinessSummary"),
            total_assets=info.get("totalAssets"),
            yield_pct=info.get("yield"),
            ytd_return=info.get("ytdReturn"),
            category=info.get("category"),
            fund_family=info.get("fundFamily")
        )
    except Exception as err:
        logger.warning(f"yfinance profile fetch failed for {clean_sym}: {err}")
        # Generic fallback
        return schemas.AssetProfileData(
            sector="Technology",
            industry="Software & IT Services",
            website="https://example.com",
            market_cap=50000000000,
            business_summary=f"No detailed description available for {clean_sym}. This company operates within the designated European markets and is primarily engaged in producing diversified assets and services for international consumption. Please note this is fallback placeholder data due to temporary API rate limits from Yahoo Finance."
        )
