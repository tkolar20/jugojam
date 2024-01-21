# JugoJam
Aplikacija za strujanje multimedije (Kafka + grafičko sučelje po želji)
___
# Kako pokrenuti

Za pokretanje aplikacije je potrebno imati instalirane **Docker** i **Docker Compose** programske pakete. \
Nakon kloniranja GitHub repozitorija potrebno je postaviti se u direktorij i pozvati naredbu: 
~~~
docker compose build
~~~ 

Nakon toga pozvati: 
~~~
docker compose up
~~~ 

Na adresi **localhost:4000** možete vidjeti početni ekran.
___
Nakon instaliranja Docker-a i Docker Compose-a možda je potrebno pokrenuti Docker servise. To se može sa naredbom
~~~
sudo systemctl start docker
~~~
ali može ovisiti o sustavu.
