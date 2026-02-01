# Placez vos certificats SSL ici
# 
# Structure requise :
# - fullchain.pem : Certificat complet (certificat + chaîne)
# - privkey.pem : Clé privée
#
# Pour générer des certificats avec Let's Encrypt :
# 
# docker run -it --rm --name certbot \
#   -v "${PWD}/nginx/ssl:/etc/letsencrypt" \
#   -v "${PWD}/nginx/certbot:/var/www/certbot" \
#   certbot/certbot certonly \
#   --webroot \
#   --webroot-path=/var/www/certbot \
#   --email votre-email@example.com \
#   --agree-tos \
#   -d votre-domaine.com
#
# Les certificats seront générés dans ce dossier
