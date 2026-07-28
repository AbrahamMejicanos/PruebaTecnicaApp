<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\News;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'demo@example.com',
        ], [
            'name' => 'Demo User',
            'password' => 'password',
        ]);

        $categories = collect([
            [
                'name' => 'Tecnologia',
                'description' => 'Noticias sobre software, inteligencia artificial y productos digitales.',
            ],
            [
                'name' => 'Negocios',
                'description' => 'Actualidad economica, empresas y tendencias de mercado.',
            ],
            [
                'name' => 'Cultura',
                'description' => 'Historias de entretenimiento, arte, lectura y vida urbana.',
            ],
        ])->mapWithKeys(function (array $category): array {
            $model = Category::query()->updateOrCreate([
                'name' => $category['name'],
            ], [
                'description' => $category['description'],
            ]);

            return [$model->name => $model];
        });

        $news = [
            [
                'category' => 'Tecnologia',
                'title' => 'Nuevas herramientas moviles aceleran el desarrollo multiplataforma',
                'excerpt' => 'Los equipos pequenos estan adoptando flujos con Expo y APIs REST para entregar prototipos mas rapido.',
                'body' => 'Los frameworks moviles basados en React continuan ganando espacio en equipos que necesitan validar productos sin duplicar esfuerzos. La combinacion de Expo, servicios centralizados y una API bien documentada permite crear experiencias Android funcionales en ciclos cortos. Para proyectos de prueba tecnica, este enfoque reduce el tiempo de configuracion y mantiene el codigo suficientemente claro para evolucionar despues.',
                'image_url' => 'https://placehold.co/900x600/0f766e/ffffff?text=Tecnologia+Movil',
                'published_at' => Carbon::now()->subHours(2),
            ],
            [
                'category' => 'Negocios',
                'title' => 'Startups regionales priorizan productos moviles en sus hojas de ruta',
                'excerpt' => 'La demanda de experiencias Android impulsa inversiones en APIs y diseno centrado en usuarios recurrentes.',
                'body' => 'Las empresas jovenes estan invirtiendo en aplicaciones moviles para mantener una relacion mas directa con sus usuarios. El foco ya no esta solo en publicar contenido, sino en ofrecer navegacion rapida, autenticacion confiable y datos personalizados. Una arquitectura separada entre backend y cliente movil facilita iterar sin comprometer todo el sistema.',
                'image_url' => 'https://placehold.co/900x600/1d4ed8/ffffff?text=Negocios',
                'published_at' => Carbon::now()->subHours(5),
            ],
            [
                'category' => 'Cultura',
                'title' => 'Lectores digitales buscan formatos breves pero con contexto',
                'excerpt' => 'Las apps de noticias experimentan con resumenes claros y detalles completos para lectura pausada.',
                'body' => 'El consumo de noticias en dispositivos moviles favorece textos introductorios breves, imagenes claras y acceso inmediato al detalle. Sin embargo, los lectores siguen valorando el contexto cuando una historia les interesa. Por eso, muchas experiencias combinan tarjetas escaneables con pantallas de detalle completas y recomendaciones relacionadas.',
                'image_url' => 'https://placehold.co/900x600/be123c/ffffff?text=Cultura',
                'published_at' => Carbon::now()->subHours(8),
            ],
            [
                'category' => 'Tecnologia',
                'title' => 'APIs con autenticacion JWT ganan terreno en aplicaciones moviles',
                'excerpt' => 'El patron sigue siendo popular para proteger endpoints y transportar identidad entre cliente y servidor.',
                'body' => 'JWT se mantiene como una alternativa frecuente en APIs consumidas por aplicaciones moviles. Su principal ventaja es permitir requests stateless con un token bearer. En Laravel, un guard dedicado permite proteger rutas y devolver errores claros cuando el token falta, expira o no corresponde a un usuario valido.',
                'image_url' => 'https://placehold.co/900x600/4338ca/ffffff?text=JWT+API',
                'published_at' => Carbon::now()->subDay(),
            ],
            [
                'category' => 'Negocios',
                'title' => 'Equipos tecnicos reducen riesgo al definir contratos API temprano',
                'excerpt' => 'Documentar endpoints antes del frontend evita cambios costosos en pantallas y servicios.',
                'body' => 'Cuando el frontend depende de una API todavia inestable, cada ajuste puede multiplicarse en pantallas, tipos y pruebas. Definir contratos tempranos con respuestas consistentes permite trabajar de forma paralela y validar el backend con pruebas automatizadas. En productos moviles, esta disciplina mejora mucho la velocidad de integracion.',
                'image_url' => 'https://placehold.co/900x600/047857/ffffff?text=Contratos+API',
                'published_at' => Carbon::now()->subDays(2),
            ],
            [
                'category' => 'Tecnologia',
                'title' => 'PostgreSQL sigue como opcion solida para contenidos relacionales',
                'excerpt' => 'Categorias, autores y noticias encajan naturalmente en un modelo relacional simple.',
                'body' => 'Para aplicaciones de noticias con categorias y relaciones claras, PostgreSQL ofrece una base robusta sin complejidad innecesaria. Las migraciones de Laravel permiten mantener el esquema versionado y reproducible. Con seeders adecuados, cualquier evaluador puede levantar una base consistente en pocos comandos.',
                'image_url' => 'https://placehold.co/900x600/7c3aed/ffffff?text=PostgreSQL',
                'published_at' => Carbon::now()->subDays(3),
            ],
            [
                'category' => 'Cultura',
                'title' => 'La curaduria editorial vuelve a tomar valor en apps pequenas',
                'excerpt' => 'No todas las apps necesitan volumen masivo; a veces importa mas una lista clara y bien ordenada.',
                'body' => 'En proyectos editoriales pequenos, la curaduria puede ser mas importante que el volumen de publicaciones. Una pantalla principal con pocas noticias bien presentadas facilita la lectura y evita fatiga. Las recomendaciones por categoria son una forma simple de extender la sesion sin construir un motor complejo.',
                'image_url' => 'https://placehold.co/900x600/a16207/ffffff?text=Curaduria',
                'published_at' => Carbon::now()->subDays(4),
            ],
            [
                'category' => 'Tecnologia',
                'title' => 'Pruebas de API ayudan a estabilizar productos moviles',
                'excerpt' => 'Feature tests cubren login, autorizacion y datos antes de conectar la interfaz Android.',
                'body' => 'Las pruebas automatizadas del backend son especialmente utiles cuando un cliente movil depende de respuestas exactas. Cubrir login, rutas protegidas, listados y casos de error permite integrar el frontend con mayor confianza. Tambien documentan el comportamiento esperado para nuevos desarrolladores.',
                'image_url' => 'https://placehold.co/900x600/0e7490/ffffff?text=Testing',
                'published_at' => Carbon::now()->subDays(5),
            ],
        ];

        foreach ($news as $item) {
            News::query()->updateOrCreate([
                'title' => $item['title'],
            ], [
                'category_id' => $categories[$item['category']]->id,
                'image_url' => $item['image_url'],
                'excerpt' => $item['excerpt'],
                'body' => $item['body'],
                'published_at' => $item['published_at'],
            ]);
        }
    }
}
