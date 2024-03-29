###  Installation
------------
- [Angular](https://angular.io/)  v15.0.0
- [VSCode](https://code.visualstudio.com/)
- NodeJs v19.7.0 (usar [nvm](https://github.com/nvm-sh/nvm))
- [Git](https://git-scm.com/) 
- [Filezilla](https://filezilla-project.org/)
- [MongoDB](https://www.mongodb.com/)

### Run locally
------------
     npm i
     npm start

### Build Cloud
------------
    docker build -t admin-poscloud . 
    docker run -d -it --name pos admin-poscloud
    rm -R /var/www/poscloud/
    docker cp pos:/app/dist/ /var/www/poscloud/

### DEV Access
------------
- url: dev.poscloud.ar
- negocio: demo
- user: admin
- pass: pos

##### Restore database

    mongorestore --db demo --archive=/src/asstes/demo.gz --gzip

### Servicios

##### Ambientes 
  - api: https://d-api-v1.poscloud.ar
  - apiv2: https://d-api-v2.poscloud.ar
  - apiPrint: https://d-api-print.poscloud.ar
  - apiStorage: https://d-api-storage.poscloud.ar
  - apiTiendaNube: https://d-api-tiendanube.poscloud.ar

### Contribuir 

------------

- git clone https://github.com/pos-cloud/system.git

Desde project de la empresa ( https://github.com/orgs/pos-cloud/projects/1 ) tomamos la feacture y el atributo branch nos dice el nombre de la rama y desde testing se crea

- git branch TK-??
Se desarrolla y se hace commit de todo sobre la rama
Luego hacemos 
- git fetch
- git checkout testing
- git pull
- git checkout TK-??
- git rebase testing
resolvemos conflicto si hay git rebase --continue
- git push --force-with-lease
Esto hace que tu commit quede sobre lo de testing 
Realizar PR a testing


#### Conventional Commits

```
#-XX <type>: <short summary>
  │	  │             │
  |	  │             └─⫸ Summary in present tense. Not capitalized. No period at the end
  |	  │
  |	  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
  |
  └─⫸ Name Task: #-123
```



##### Type

Must be one of the following:

-   **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
-   **ci**: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
-   **docs**: Documentation only changes
-   **feat**: A new feature
-   **fix**: A bug fix
-   **perf**: A code change that improves performance
-   **refactor**: A code change that neither fixes a bug nor adds a feature
-   **test**: Adding missing tests or correcting existing tests



######

// old worker cloudflare

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  return Response.redirect('https://pos-cloud.github.io/system/dev', 301)
}


#### Doc para servidores
Puerto para este servidor que estas destinados a las API

300 api-v1-poscloud
301 api-fit
302 api-pdf-poscloud
303 api-storage-poscloud
304 front-poscloud
308 api-v2-poscloud

Agregar un nuevo sitio 
- primero verificamos que el puerto no esta ocupado 
	netstat -tuln | grep 301
- segundo creamos el archivo dentro de 
	cd /etc/apache2/sites-available/
- agregamos el sitio 
	sudo a2ensite prod.poscloud
- verificamos que este bien configurado apache 
	sudo apache2ctl configtest
- recargamos la config
	sudo systemctl reload apache2

Caso de tener que volver atrás 
- sudo a2dissite nombre_del_sitio
- sudo systemctl reload apache2

