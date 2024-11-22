import streamlit as st
import os
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase
from models import db, Event, EventConfiguration, EventType
from event_handler import EventHandler
from app import app

# Set page config
st.set_page_config(page_title="Form Configuration System", layout="wide")

# Initialize session state for counters if not exists
if 'event_metadata_count' not in st.session_state:
    st.session_state.event_metadata_count = 0
if 'event_type_metadata_count' not in st.session_state:
    st.session_state.event_type_metadata_count = 0
if 'event_dates_count' not in st.session_state:
    st.session_state.event_dates_count = 0

def increase_counter(counter_name):
    if getattr(st.session_state, counter_name) < 20:  # Maximum 20 fields
        setattr(st.session_state, counter_name, getattr(st.session_state, counter_name) + 1)

def decrease_counter(counter_name):
    if getattr(st.session_state, counter_name) > 0:
        setattr(st.session_state, counter_name, getattr(st.session_state, counter_name) - 1)

def main():
    st.title("Form Configuration System")

    with st.form("event_configuration"):
        # Event Reference
        event_reference = st.text_input("Event Reference", required=True)
        
        # Event Type
        event_type = st.text_input("Event Type", required=True)
        
        # Event Type Metadata
        st.subheader("Event Type Metadata")
        col1, col2, col3 = st.columns([1, 6, 1])
        with col1:
            if st.button("-", key="decrease_type_metadata"):
                decrease_counter("event_type_metadata_count")
        with col2:
            st.write(f"Count: {st.session_state.event_type_metadata_count}")
        with col3:
            if st.button("+", key="increase_type_metadata"):
                increase_counter("event_type_metadata_count")

        event_type_metadata = {}
        for i in range(st.session_state.event_type_metadata_count):
            col1, col2 = st.columns(2)
            with col1:
                key = st.text_input(f"Key {i+1}", key=f"type_metadata_key_{i}")
            with col2:
                value = st.text_input(f"Value {i+1}", key=f"type_metadata_value_{i}")
            if key and value:
                event_type_metadata[key] = value

        # Event Description
        event_description = st.text_area("Event Description")

        # Event Metadata
        st.subheader("Event Metadata")
        col1, col2, col3 = st.columns([1, 6, 1])
        with col1:
            if st.button("-", key="decrease_metadata"):
                decrease_counter("event_metadata_count")
        with col2:
            st.write(f"Count: {st.session_state.event_metadata_count}")
        with col3:
            if st.button("+", key="increase_metadata"):
                increase_counter("event_metadata_count")

        event_metadata = {}
        for i in range(st.session_state.event_metadata_count):
            col1, col2 = st.columns(2)
            with col1:
                key = st.text_input(f"Key {i+1}", key=f"metadata_key_{i}")
            with col2:
                value = st.text_input(f"Value {i+1}", key=f"metadata_value_{i}")
            if key and value:
                event_metadata[key] = value

        # Event Dates
        st.subheader("Event Dates")
        validity_start = st.date_input("Validity Start Date")
        validity_end = st.date_input("Validity End Date")

        col1, col2, col3 = st.columns([1, 6, 1])
        with col1:
            if st.button("-", key="decrease_dates"):
                decrease_counter("event_dates_count")
        with col2:
            st.write(f"Count: {st.session_state.event_dates_count}")
        with col3:
            if st.button("+", key="increase_dates"):
                increase_counter("event_dates_count")

        event_dates = []
        for i in range(st.session_state.event_dates_count):
            date = st.date_input(f"Event Date {i+1}", key=f"event_date_{i}")
            if date:
                event_dates.append(date.isoformat())

        # Submit button
        submitted = st.form_submit_button("Save")
        
        if submitted:
            try:
                # Create event configuration
                event_config = EventConfiguration(
                    event_reference=event_reference,
                    event_type=event_type,
                    event_description=event_description,
                    event_metadata=event_metadata,
                    event_type_metadata=event_type_metadata,
                    event_dates={"dates": event_dates},
                    validity_start_date=datetime.combine(validity_start, datetime.min.time()) if validity_start else None,
                    validity_end_date=datetime.combine(validity_end, datetime.min.time()) if validity_end else None
                )
                
                db.session.add(event_config)
                db.session.flush()

                # Create event creation event
                event = Event(
                    type=EventType.EVENT_CREATED.value,
                    data={
                        "event_reference": event_reference,
                        "event_type": event_type,
                        "event_description": event_description,
                        "event_metadata": event_metadata,
                        "event_type_metadata": event_type_metadata,
                        "event_dates": {"dates": event_dates},
                        "validity_start_date": validity_start.isoformat() if validity_start else None,
                        "validity_end_date": validity_end.isoformat() if validity_end else None
                    },
                    event_config_id=event_config.id
                )
                
                db.session.add(event)
                db.session.commit()
                
                st.success("Event saved successfully!")
                
                # Reset counters
                st.session_state.event_metadata_count = 0
                st.session_state.event_type_metadata_count = 0
                st.session_state.event_dates_count = 0
                
            except Exception as e:
                db.session.rollback()
                st.error(f"Error saving event: {str(e)}")

if __name__ == "__main__":
    main()
