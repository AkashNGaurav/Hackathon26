from datetime import datetime
from app import db, crud


def seed():
    session = db.SessionLocal()
    try:
        crud.create_market_news(
            session,
            title="European equities rebound on AI optimism",
            source="Financial Times",
            sentiment="positive",
            excerpt="Investors are bullish as AI-related earnings fuel a broad market rally.",
        )
        crud.create_market_news(
            session,
            title="Central bank signals cautious policy ahead",
            source="Reuters",
            sentiment="neutral",
            excerpt="The ECB is expected to keep rates stable while monitoring inflation data.",
        )
        crud.create_market_news(
            session,
            title="Energy costs weigh on smaller firms",
            source="Bloomberg",
            sentiment="negative",
            excerpt="Higher operating expenses are putting pressure on profit margins across Europe.",
        )
    finally:
        session.close()


if __name__ == '__main__':
    seed()
