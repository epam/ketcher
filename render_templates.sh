for i in icons/mol/template*.mol; do
./depict $i icons/png/template/`basename $i | sed 's/.mol/.png/g'` -hydro off -w 128 -h 128 -margins 0 0 -thickness 1.5
./depict $i icons/png/template/`basename $i | sed 's/.mol/.24.png/g'` -hydro off -w 128 -h 128 -margins 0 0 -thickness 1.5
done
